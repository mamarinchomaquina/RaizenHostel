import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContenidoService } from '../../core/services/contenido.service';
import { ContenidoHero, ContenidoNosotros, GaleriaImagen } from '../../core/models/contenido.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AlertaComponent } from '../../shared/components/alerta/alerta.component';

type Tab = 'hero' | 'nosotros' | 'galeria';

@Component({
  selector: 'rz-contenido-admin',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, IconComponent, AlertaComponent],
  templateUrl: './contenido-admin.component.html',
  styleUrl: './contenido-admin.component.scss',
})
export class ContenidoAdminComponent implements OnInit {
  private contenidoSvc = inject(ContenidoService);
  private fb = inject(FormBuilder);

  tab     = signal<Tab>('hero');
  saving  = signal(false);
  error   = signal('');
  success = signal('');

  heroForm = this.fb.group({
    titulo:    ['', Validators.required],
    subtitulo: [''],
    cta_texto: [''],
    cta_link:  [''],
  });

  nosotrosForm = this.fb.group({
    titulo:   ['', Validators.required],
    parrafo1: [''],
    parrafo2: [''],
  });

  galeria      = signal<GaleriaImagen[]>([]);
  galeriaFile  = signal<File | null>(null);
  galeriaPreview = signal<string | null>(null);
  altTextInput = signal('');

  ngOnInit(): void {
    this.contenidoSvc.getSeccion<ContenidoHero>('hero').subscribe({
      next: d => this.heroForm.patchValue(d),
      error: () => {},
    });
    this.contenidoSvc.getSeccion<ContenidoNosotros>('nosotros').subscribe({
      next: d => this.nosotrosForm.patchValue(d),
      error: () => {},
    });
    this.contenidoSvc.getGaleria().subscribe({
      next: g => this.galeria.set(g),
      error: () => {},
    });
  }

  setTab(t: Tab): void {
    this.tab.set(t);
    this.error.set('');
    this.success.set('');
  }

  guardarHero(): void {
    if (this.heroForm.invalid) return;
    this.saving.set(true); this.error.set(''); this.success.set('');
    this.contenidoSvc.updateSeccion('hero', this.heroForm.value).subscribe({
      next: () => { this.success.set('Sección Hero actualizada.'); this.saving.set(false); },
      error: () => { this.error.set('Error al guardar.'); this.saving.set(false); },
    });
  }

  guardarNosotros(): void {
    if (this.nosotrosForm.invalid) return;
    this.saving.set(true); this.error.set(''); this.success.set('');
    this.contenidoSvc.updateSeccion('nosotros', this.nosotrosForm.value).subscribe({
      next: () => { this.success.set('Sección Nosotros actualizada.'); this.saving.set(false); },
      error: () => { this.error.set('Error al guardar.'); this.saving.set(false); },
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.galeriaFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.galeriaPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  subirImagen(): void {
    const file = this.galeriaFile();
    if (!file) return;
    this.saving.set(true); this.error.set(''); this.success.set('');
    this.contenidoSvc.uploadGaleriaImagen(file, { alt_text: this.altTextInput() }).subscribe({
      next: img => {
        this.galeria.update(g => [...g, img]);
        this.galeriaFile.set(null);
        this.galeriaPreview.set(null);
        this.altTextInput.set('');
        this.success.set('Imagen subida exitosamente.');
        this.saving.set(false);
      },
      error: () => { this.error.set('Error al subir imagen.'); this.saving.set(false); },
    });
  }

  eliminarImagen(img: GaleriaImagen): void {
    this.error.set(''); this.success.set('');
    this.contenidoSvc.deleteGaleriaImagen(img.id).subscribe({
      next: () => {
        this.galeria.update(g => g.filter(x => x.id !== img.id));
        this.success.set('Imagen eliminada.');
      },
      error: () => this.error.set('Error al eliminar imagen.'),
    });
  }
}
