import { Directive, ElementRef, Input, AfterViewInit, inject } from '@angular/core';

@Directive({
  selector: '[rzReveal]',
  standalone: true,
  host: { class: 'reveal' }
})
export class RevealDirective implements AfterViewInit {
  @Input() rzDelay = 0;
  private el = inject(ElementRef);

  ngAfterViewInit(): void {
    if (this.rzDelay) {
      (this.el.nativeElement as HTMLElement).style.transitionDelay = `${this.rzDelay}ms`;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    io.observe(this.el.nativeElement);
  }
}
