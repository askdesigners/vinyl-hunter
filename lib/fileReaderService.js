import fs from 'fs'

export default class FileReaderService {
  constructor() { }

  readAudioDir(dir) {
    return this.cleanFileNames(fs.readdirSync(dir).filter(fn => fn.endsWith('.m4a')));
  }

  readMetaDir(dir) {
    return fs.readdirSync(dir).filter(fn => fn.endsWith('.json'));
  }

  getJson(path) {
    try {
      return JSON.parse(fs.readFileSync(path));
    } catch (error) {
      console.log('Error getting track meta file', path);
      return {
        error: path
      };
    }
  }

  cleanFileNames(files) {
    return files.map((fileName) => {
      return {
        orig: fileName,
        clean: this.cleanFileName(fileName)
      }
    })
  }

  cleanFileName(fileName) {
    const pattern = /\[.*\]\.m4a/
    return {
      orig: fileName,
      clean: fileName.replace(pattern, '').replace('  ', '').trim()
    }
  }

  writeTrackJson(metaDir, name, data) {
    try {
      fs.writeFileSync(`${metaDir}/${name.replace('.m4a', '.json')}`, JSON.stringify(data));
    } catch (error) {
      console.log(`Error writing track json`, error);
    }
  }

  writeErrorJson(data) {
    fs.writeFileSync(`../errors/meta_errors.json`, JSON.stringify(data));
  }
}