import ChildProcess from 'child_process'

export default class Id3TagService {
  constructor() {
    this.ffmpeg = ChildProcess.exec
  }

  writeTags(payload, cleanFile, dir, filePath) {
    const tags = this.mapAttrs(payload, cleanFile);
    const args = Object.keys(tags).map((key) => `-metadata ${key}="${tags[key]}"`).join(' ')
    const command = ` ffmpeg -i "${filePath}" ${args} {/Users/ryan/Documents/Production/Records/Rips/TaggedHouse/${filePath}}`;
    return new Promise((resolve, reject) => {
      this.ffmpeg(command, {
        cwd: '/Users/ryan/Documents/Production/Records/Rips/House'
      }, (err, stdout, stderr) => {
        if (err) {
          return reject(err, command, stdout);
        }
        return resolve(cleanFile);
      });
    })
  }

  mapAttrs(payload, cleanFile) {
    return {
      title: payload.title || cleanFile,
      genre: payload.style.slice(0, 3).join(', '),
      mediaType: payload.format[0],
      publisher: payload.label[0],
      description: payload.label[0],
      year: payload.year,
      // author
      // remixArtist
      // userDefinedText: [{
      //   description: "country",
      //   value: payload.country
      // }]
    }
  }
}
