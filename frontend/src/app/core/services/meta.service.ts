import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface MetaConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

@Injectable({ providedIn: 'root' })
export class MetaService {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  setPage(config: MetaConfig): void {
    this.titleService.setTitle(config.title);
    this.meta.updateTag({ name: 'description',        content: config.description });
    this.meta.updateTag({ property: 'og:title',       content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
    if (config.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: config.ogImage });
    }
    this.setCanonical(`https://raizenhostel.com${this.doc.location.pathname}`);
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
