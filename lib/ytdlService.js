import child_process from 'child_process';

export default class YTDLService {
  constructor(dir) {
    this.dir = dir;
  }

  getPlaylist(playlistId, callback) {
    const command = `yt-dlp -f 'bestaudio[ext=m4a]' --quiet --no-simulate --print '%(title)s[%(id)s].%(ext)s' --no-progress --no-warnings --hls-prefer-ffmpeg --write-thumbnail --yes-playlist --extract-audio --audio-quality 0 -o '${this.dir}/%(title)s[%(id)s].%(ext)s' -o 'thumbnail:${this.dir}/%(title)s[%(id)s].%(ext)s' "https://www.youtube.com/playlist?list=${playlistId}"`;
    const ytdlCommand = child_process.exec(command, {
      cwd: this.dir
    })

    ytdlCommand.stdout.on('data', (trackName) => {
      callback(null, trackName.replace(/\n/, ''), false);
    });

    ytdlCommand.stderr.on('data', (data) => {
      callback({ errorCode: data }, null, false);
    });

    ytdlCommand.on('error', (code) => {
      callback({ errorCode: code }, null, false);
    });

    ytdlCommand.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      callback(null, null, true);
    });
    // })
  }
}
