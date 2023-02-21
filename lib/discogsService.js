import disconnect from 'disconnect';

export default class DiscogsService {
  constructor() {
    const client = new disconnect.Client('RyanAppEnricher/1.0', { userToken: 'zbJiWsOvjCwIDAyDHxArGWgTCXkIgfMiYmmVfDBR' })
    this.db = client.database();
    this.enrichmentQueue = []
  }

  search(query, params) {
    return this.db.search(query, params);
  }

  findGoodMeta(metadata) {
    return !!metadata && metadata.find((meta) => meta.type === 'master');
  }
}