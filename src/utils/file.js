/**
 * File name: app\utils\file.js
 * Created by Visual studio code
 * User: Danh Le / danh.le@dinovative.com
 * Date: 2020-05-14 15:25:32
 */
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const { exec } = require('child_process')
const { ensureArray } = require('./helpers')
const { COPYFILE_EXCL } = fs.constants

/** Start: upload section */
const writeFile = (readableStreamFile, fileName, uploadPath) => {
  return new Promise(function (resolve, reject) {
    const filePath = path.join(uploadPath, fileName)
    const writeStream = fs.createWriteStream(filePath)

    writeStream.on('error', reject)
    readableStreamFile.pipe(writeStream)
    readableStreamFile.on('end', function () {
      const fileInfo = {
        filePath,
        fileName
      }

      writeStream.close(() => {
        return resolve(fileInfo)
      })
    })
  })
}

const upload = async (stream, fileName, uploadPath) => {
  /* Validate type file supported */
  const _allowTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx', 'csv', 'pptx', 'xlsx', 'mp3', 'mp4', 'webm', 'mkv', 'flv', 'vob', 'ogv', 'ogg', 'drc', 'gifv', 'mng', 'avi', 'mov', 'qt', 'wmv', 'yuv', 'rm', 'rmvb', 'asf', 'amv', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'svi', '3gp', '3g2', 'mxf', 'roq', 'nsv', 'f4v', 'f4p', 'f4a', 'f4b']
  const regex = new RegExp('.(' + _allowTypes.join('|') + ')$', 'i')
  if (!fileName.match(regex)) {
    throw new Error('Not supported file types.')
  }

  try {
    fs.accessSync(uploadPath, fs.constants.W_OK)
  } catch (error) {
    throw new Error('Access denied, cannot write file to disk.')
  }

  // save file to disk
  return writeFile(stream, fileName, uploadPath)
}
/** End: upload section */

const move = (oldPath = '', newPath = '') => {
  fs.renameSync(oldPath, newPath)
  return newPath
}

/**
 * Check path is exists or not
 * @param {String} filePath
 * @return {Boolean}
 */
const exist = filePath => fs.existsSync(filePath)

/**
 * Check path is is File or not
 * @param {String} filePath
 * @return {Boolean}
 */
const isFile = filePath => fs.lstatSync(filePath).isFile()

/**
 * Check path is is Directory or not
 * @param {String} filePath
 * @return {Boolean}
 */
const isDirectory = dirPath => fs.lstatSync(dirPath).isDirectory()

const copySync = (filePath, copyFilePath, replace = false) => {
  // COPYFILE_EXCL the operation will fail if copyFilePath exists
  return fs.copyFileSync(filePath, copyFilePath, replace ? 0 : COPYFILE_EXCL)
}

const copyAsync = (filePath, copyFilePath, replace = false) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(filePath, copyFilePath, replace ? 0 : COPYFILE_EXCL, error => {
      if (error) {
        return reject(error)
      }
      return resolve()
    })
  })
}

const getContent = filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, content) => {
      if (error) {
        return reject(error)
      }

      return resolve(content)
    })
  })
}

const deleteFile = filePath => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, error => {
        if (error) {
          return reject(error)
        }
        return resolve(true)
      })
    } else {
      return resolve()
    }
  })
}

const deleteDirectory = (dir) => {
  return new Promise((resolve, reject) => {
    let cmd
    if (process.platform === 'win32') {
      // Work on windows
      cmd = `rmdir ${dir} /s /q`
    } else {
      cmd = `rm -rf ${dir}`
    }

    exec(cmd, { maxBuffer: 1000000 * 1024 }, (error, stdout, stderr) => {
      // console.log('stdout: ', stdout)
      // console.log('stderr: ', stderr)

      if (error) {
        return reject(error)
      }

      return resolve(true)
    })
  })
}

const deleteDirectories = async (dirs) => {
  if (!Array.isArray(dirs)) {
    dirs = [dirs]
  }

  for (const dir of dirs) {
    await deleteDirectory(dir)
  }
}

const ensureDirExists = directory => {
  return !directory
    .replace(process.cwd(), '')
    .split(/\\|\//)
    .reduce(({ fullPath, notEnsure }, part, index, paths) => {
      if (part) {
        fullPath = path.join(fullPath, part)
      }
      return {
        fullPath,
        notEnsure: !fs.existsSync(fullPath) && fs.mkdirSync(fullPath)
      }
    }, { fullPath: process.cwd(), notEnsure: false })
    .notEnsure
}

const zip = (destination = '', files = []) => {
  return new Promise((resolve, reject) => {
    files = ensureArray(files, [files])

    // create a file to stream archive data to.
    const output = fs.createWriteStream(destination)
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes')
      console.log('archiver has been finalized and the output file descriptor has closed.')
      return resolve({ path: destination, size: archive.pointer() })
    })

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', () => {
      console.log('End create zip: ', destination)
      console.log('Data has been drained')
    })

    output.on('finish', () => {
      console.log('Finish create zip: ', destination)
    })

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        return reject(err)
      }
    })

    // good practice to catch this error explicitly
    archive.on('error', err => {
      return reject(err)
    })

    // pipe archive data to the file
    archive.pipe(output)

    // append a file from stream
    // let file1 = __dirname + '/file1.txt'
    // archive.append(fs.createReadStream(file1), { name: 'file1.txt' })

    // append a file from string
    // archive.append('string cheese!', { name: 'file2.txt' })

    // append a file from buffer
    // let buffer3 = Buffer.from('buff it!');
    // archive.append(buffer3, { name: 'file3.txt' })

    // append a file
    try {
      for (const filePath of files) {
        if (!exist(filePath)) {
          return reject(new Error(`${filePath} not found.`))
        }

        if (isFile(filePath)) {
          archive.file(filePath, { name: filePath.split(/\/|\\/).pop() })
        } else if (isDirectory(filePath)) {
          archive.directory(filePath, false)
        }
      }
    } catch (error) {
      return reject(error)
    }

    // append files from a sub-directory and naming it `new-subdir` within the archive
    // archive.directory('subdir/', 'new-subdir')

    // append files from a sub-directory, putting its contents at the root of archive
    // archive.directory('subdir/', false)

    // append files from a glob pattern
    // archive.glob('subdir/*.txt')

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize()
  })
}

const unzip = (filePath, unzipPath) => {
  return new Promise((resolve, reject) => {
    let cmd
    if (process.platform === 'win32') {
      // Work on powershell on windows
      cmd = `powershell.exe -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::ExtractToDirectory('${filePath}', '${unzipPath}'); }"`
    } else {
      cmd = `unzip ${filePath} -d ${unzipPath}`
    }

    exec(cmd, { maxBuffer: 1000000 * 1024 }, (err, stdout, stderr) => {
      // console.log('stdout: ', stdout)
      // console.log('stderr: ', stderr)

      if (err) {
        // console.log(err)
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = {
  upload,
  move,
  exist,
  copySync,
  copyAsync,
  getContent,
  del: deleteFile,
  delete: deleteFile,
  deleteFile,
  delDir: deleteDirectory,
  deleteDir: deleteDirectory,
  deleteDirectory,
  deleteDirectories,
  deleteDirs: deleteDirectories,
  zip,
  unzip,
  ensureDirExists
}
