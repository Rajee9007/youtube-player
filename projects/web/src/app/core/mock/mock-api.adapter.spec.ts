import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockApiAdapter } from './mock-api.adapter';

describe('MockApiAdapter', () => {
  let adapter: MockApiAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockApiAdapter],
    });
    adapter = TestBed.inject(MockApiAdapter);
  });

  it('should return initial 5 channels', async () => {
    const res = await firstValueFrom(adapter.getChannels());
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(5);
  });

  it('should fetch home data with featured video and channels', async () => {
    const res = await firstValueFrom(adapter.getHomeData());
    expect(res.success).toBe(true);
    expect(res.data.featuredVideo).toBeTruthy();
    expect(res.data.channels.length).toBe(5);
    expect(res.data.trendingVideos.length).toBeGreaterThan(0);
  });

  it('should authenticate admin with valid password', async () => {
    const res = await firstValueFrom(adapter.adminLogin('admin123'));
    expect(res.success).toBe(true);
    expect(res.data.token).toBeTruthy();
  });

  it('should fail admin authentication with wrong password', async () => {
    try {
      await firstValueFrom(adapter.adminLogin('wrongpassword'));
      expect.unreachable('Should have thrown an error');
    } catch (err: any) {
      expect(err.message).toContain('Invalid administrative password');
    }
  });
});
