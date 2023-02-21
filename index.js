import fs from 'fs'

import DiscogsService from './lib/discogsService.js'
import FileReaderService from './lib/fileReaderService.js'
import Id3TagService from './lib/id3TagService.js'
import YTDLService from './lib/ytdlService.js'

class App {
  constructor(dirName) {
    this.songsDir = `/Users/ryan/Documents/Production/Records/Rips/${dirName}`;
    this.metaDir = `${this.songsDir}Meta`;

    if (!fs.existsSync(this.songsDir)) {
      fs.mkdirSync(this.songsDir);
      console.log(`Made dir: ${this.songsDir}`);
    }

    if (!fs.existsSync(this.metaDir)) {
      fs.mkdirSync(this.metaDir);
      console.log(`Made dir: ${this.metaDir}`);
    }

    this.discogs = new DiscogsService();
    this.files = new FileReaderService();
    this.tagger = new Id3TagService();
    this.ytdl = new YTDLService(this.songsDir);

    this.enrichmentQueue = []
    this.enrichmentQueueRunning = false;
    this.start = new Date();
  }

  async fetchPlaylists(playlists) {
    for (let index = 0; index < playlists.length; index++) {
      const pl = playlists[index];
      await new Promise((resolve, reject) => {
        this.ytdl.getPlaylist(pl, async (err, trackName, done) => {
          if (done) {
            console.log('Done with audio fetch. Running final enrichment batch.');
            this.enrichmentQueueRunning = false;
            await this.enrichFromQueue();
            resolve();
          } else if (err) {
            console.log("ytdl error", err);
          } else {
            this.enqueueEnrichment(trackName);
          }
        });
      });
      console.log(`Finished playlist ${pl}`);
      console.log(`Time since start: ${(new Date() - this.start) / 1000 / 60} mins`);
    }
  }

  enqueueEnrichment(trackName) {
    const cleanName = this.files.cleanFileName(trackName)
    console.log('Adding file to enrich', cleanName.clean);
    this.enrichmentQueue.push(cleanName);
    this.enrichFromQueue();
  }

  async enrichFromQueue() {
    if (this.enrichmentQueueRunning === false) {
      this.enrichmentQueueRunning = true;
      const chunkItems = this.enrichmentQueue.splice(0, this.enrichmentQueue.length);
      console.log(`Taking ${chunkItems.length} for enrichment batch...`);
      const errorTracker = {};

      for (let index = 0; index < chunkItems.length; index++) {
        const { clean, orig } = chunkItems[index];
        errorTracker[clean] = 0;
        try {
          const data = await this.discogs.search(clean, { searchType: 'master' })
          this.files.writeTrackJson(this.metaDir, orig, data);
        } catch (error) {
          if (error.statusCode === 429) {
            console.log('Rate limited, waiting 62s to retry...');
            await new Promise(r => setTimeout(r, 1000 * 62));
            index--;
          } else if (error.statusCode === 500) {
            errorTracker[clean]++;
            console.log('500 error');
            if (errorTracker[clean] <= 2) {
              console.log('Less than 2 errors for track. Waiting 15s to retry...');
              await new Promise(r => setTimeout(r, 1000 * 15));
              index--;
            } else {
              console.log(`More than 2 errors for track. Skipping. ${orig}`);
            }
          } else {
            throw error;
          }
        }
      }
      this.enrichmentQueueRunning = false;
    }
  }

  async fetchDirEnrichments() {
    const start = new Date();
    const trackNames = this.files.readAudioDir(`../${this.songsDir}`);
    console.log(`Running enrichments for ${trackNames.length} tracks...`);
    const results = [];
    const errorTracker = {};
    for (let index = 0; index < trackNames.length; index++) {
      const { clean, orig } = trackNames[index];
      errorTracker[clean] = 0;
      try {
        const data = await this.discogs.search(clean, { searchType: 'master' })
        this.files.writeTrackJson(this.metaDir, orig, data);
      } catch (error) {
        if (error.statusCode === 429) {
          console.log('Rate limited, waiting 62s to retry...');
          await new Promise(r => setTimeout(r, 1000 * 62));
          index--;
        } else if (error.statusCode === 500) {
          errorTracker[clean]++;
          console.log('500 error');
          if (errorTracker[clean] <= 2) {
            console.log('Waiting 15s to retry...');
            await new Promise(r => setTimeout(r, 1000 * 15));
            index--;
          } else {
            console.log(`Skipping track because of errors. ${orig}`);
          }
        } else {
          throw error;
        }
      }
    }
    const end = new Date();
    console.log(`Enriched ${trackNames.length} tracks in ${(end - start) / 1000 / 60} mins`);
  }

  async writeTags() {
    console.log('Writing tags');
    const noMeta = [];
    const cleanTrackFiles = this.files.readAudioDir(`../${this.songsDir}`);
    for (let index = 0; index < cleanTrackFiles.length; index++) {
      const meta = this.files.getJson(`../${this.metaDir}/${cleanTrackFiles[index].orig.replace('.m4a', '.json')}`);
      const goodMeta = this.discogs.findGoodMeta(meta.results);
      if (goodMeta) {
        try {
          const result = await this.tagger.writeTags(goodMeta, cleanTrackFiles[index].clean, `../${this.songsDir}`, cleanTrackFiles[index].orig)
          console.log(`Wrote meta for`, cleanTrackFiles[index].orig, result);
        } catch (tagging_error) {
          console.log(`Error writing meta for`, cleanTrackFiles[index].orig, tagging_error);
          noMeta.push({ tagging_error })
        }
      } else {
        console.log(`No good meta in ${meta.results} results...`);
        noMeta.push(cleanTrackFiles[index]);
      }
    }
    this.files.writeErrorJson(noMeta);
    console.log('complete!');
    console.log(`Wrote ${noMeta.length} errors to file.`);
  }
}

// new App().fetchEnrichment();


// new App().writeTags();

const neurofunk = ["PLj5ocx7kvwbOYlnvrl92GECzZqIjPWrbV"];

const uk_garage = [
  "PLaR71fpxu_SSzBQk7JFZ8UierUfO13DIW",
  "PLmutGYdNIhMF246_h2VAlnRC-pykqRkqc",
  "PLEE3vXQUmxY4lw4WnUzr4Mj3Gtfkae1ba",
  "PLnk-kvXqq0FzoglY3hzeVXsVeWV3tYHeI",
  "PLeJ8z5jjJOnUML5oWrjwecLZYHC8GMp9w",
  "PLCEO-Smq-kJVRBFsFemwWPCv8NYew9gWS",
  "PLKjo4lXYofXrSzKVk30PaBxso9g6fBTxs"
];

const classicHouse = [
  "PLDIkTmS_JW9MJED2W5_RYkJM1veAVev8X",
  "PLMdPIsQnk_E8iOlnVDJ3P-MhEOYQMpBv0",
  "PLrcKgzg27YKhzvbfuYYqze9U-l5iqNK1S",
  "PLawZ_EwnsfbOV6aqy5INnn7OWx-qjtcQQ"
]

const deepHouse90s = [
  "PLhUZK4ON2ODTPNjS_SmsjSMQfOTNsO8xm"
]

const techno = [
  "PL0MKprfFIEpzK0gPNZaZbOHmvj4JM-pKe",
  "PLO1TSW_xG8o5o-yq32Dcwip3DV8DIrUMy"
]

const funk = [
  "PLBA986EF6C0FAA1D9",
  "PLFK9SMgFPIoCUt9SyJFywfuevkiCbnpkr",
  "PLcM4ZwI542CriszmMjt8HSOJ-dVzKo3O3",
  "PLbLEJMERqb2F3YkFAHr6Sxd51Y-rB8LIc",
]

const disco = [
  "PLGBuKfnErZlAGTaM4VCcpOPCUjpQu0HmW",
  "PLOHUwPT-3y59JLdTG1Hg0GWja6-YfjfZI",
  "PL1oBy9g5AfdbuAB848rTaAUdqqNglwTLY",
]

const czechDisco = [
  "PLYoQCRtxAW8EDlumra14m94iSjlkxI7Ez",
]

const newWave = [
  "PLkF8z4_rEiHgaiTjiX6nWkR_GE71a9BlB",
  "PLL1NQSkQU5Ldq-L8OcLv-o0FhV95Ld3_0",
]

const synthWave = [
  "PLbFwajYWEkFDQdTRiG-kLgAYWREOjbB-3",
  "PLHQ0xKUMxXGv8Hed5TgzzCgT2YPIivJXs",
  "PLMCly1sOjt62xNf-DXwDz7LPHSLSc4CTz",
  "PLEelxuGt2Io5jGNnA44S9lRhclhz7po1U",
  "PLktdtTNubKSofHsICrxW9KE9DeFPFYqoG",
]

new App('ClassicHouse').fetchPlaylists(classicHouse);


