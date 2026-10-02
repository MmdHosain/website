import { SocialPost } from '../../domain/integrations/IntegrationPorts';
import { HttpError } from '../../application/errors';
import { jsonHttp, secureUrl } from './jsonHttp';

export class InstagramProvider {
  constructor(private env: NodeJS.ProcessEnv = process.env, private transport: typeof fetch = fetch) {}
  configured(): boolean {
    return this.env.INSTAGRAM_ENABLED === 'true' && Boolean(this.env.INSTAGRAM_ACCESS_TOKEN) &&
      /^\d+$/.test(this.env.INSTAGRAM_USER_ID || '') && /^v\d+\.\d+$/.test(this.env.INSTAGRAM_API_VERSION || '');
  }
  async readPosts(): Promise<SocialPost[]> {
    if (!this.configured()) throw new HttpError(503, 'Instagram is not configured');
    const url = new URL(`https://graph.instagram.com/${this.env.INSTAGRAM_API_VERSION}/${this.env.INSTAGRAM_USER_ID}/media`);
    url.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp');
    url.searchParams.set('limit', '12');
    const data = await jsonHttp(url.href, { headers: { Authorization: `Bearer ${this.env.INSTAGRAM_ACCESS_TOKEN}` } }, this.transport);
    if (!Array.isArray(data.data)) throw new HttpError(502, 'Instagram returned invalid media');
    return data.data.slice(0, 12).flatMap((post: any) => {
      const permalink = secureUrl(post.permalink);
      const publishedAt = new Date(post.timestamp);
      if (!permalink || !['instagram.com', 'www.instagram.com'].includes(new URL(permalink).hostname) || !/^\d+$/.test(String(post.id)) || isNaN(publishedAt.getTime())) return [];
      return [{ id: String(post.id), caption: String(post.caption || '').slice(0, 2200), permalink,
        imageUrl: secureUrl(post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url), publishedAt: publishedAt.toISOString() }];
    });
  }
}
