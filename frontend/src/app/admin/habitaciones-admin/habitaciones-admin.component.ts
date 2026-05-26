import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { Habitacion } from '../../core/models/habitacion.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AlertaComponent } from '../../shared/components/alerta/alerta.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';

interface TipoAdmin {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  capacidad: number;
  precio_base: number;
  popular: boolean;
  total_unidades: number;
  unidades_disponibles: number;
}

@Component({
  selector: 'rz-habitaciones-admin',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, IconComponent, AlertaComponent, BadgeComponent, CopCurrencyPipe],
  templateUrl: './habitaciones-admin.component.html',
  styleUrl: './habitaciones-admin.component.scss',
})
export class HabitacionesAdminComponent implements OnInit {
  private habSvc = inject(HabitacionesService);
  private fb     = inject(FormBuilder);

  // ── Tab management ──
  activeTab = signal<'tipos' | 'unidades'>('tipos');

  // ── Tipos ──
  tipos        = signal<TipoAdmin[]>([]);
  editandoTipo = signal<TipoAdmin | null>(null);
  tipoError    = signal('');
  tipoSuccess  = signal('');
  savingTipo   = signal(false);

  tipoForm = this.fb.group({
    nombre:      ['', Validators.required],
    descripcion: ['', Validators.required],
    precio_base: [0, [Validators.required, Validators.min(1)]],
    popular:     [false],
  });

  // ── Unidades ──
  habitaciones = signal<Habitacion[]>([]);
  editando     = signal<Habitacion | null>(null);
  loading      = signal(true);
  saving       = signal(false);
  error        = signal('');
  success      = signal('');
  imageFile    = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  form = this.fb.group({
    nombre_display: ['', Validators.required],
    descripcion:    ['', Validators.required],
    precio:         [0, [Validators.required, Validators.min(1)]],
    disponible:     [true],
  });

  ngOnInit(): void {
    this.loadTipos();
    this.loadUnidades();
  }

  private loadTipos(): void {
    this.habSvc.getAdminTipos().subscribe({
      next: t => this.tipos.set(t),
      error: () => this.tipoError.set('Error al cargar los tipos de habitación.'),
    });
  }

  private loadUnidades(): void {
    this.habSvc.getAll().subscribe({
      next: h => {
        this.habitaciones.set(h);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ── Tab ──
  switchTab(tab: 'tipos' | 'unidades'): void {
    this.activeTab.set(tab);
    this.editandoTipo.set(null);
    this.editando.set(null);
  }

  // ── Tipos CRUD ──
  editarTipo(t: TipoAdmin): void {
    this.editandoTipo.set(t);
    this.tipoForm.patchValue({
      nombre: t.nombre,
      descripcion: t.descripcion,
      precio_base: t.precio_base,
      popular: t.popular,
    });
    this.tipoError.set('');
    this.tipoSuccess.set('');
  }

  cancelarTipo(): void {
    this.editandoTipo.set(null);
    this.tipoForm.reset();
  }

  guardarTipo(): void {
    if (this.tipoForm.invalid || !this.editandoTipo()) return;
    this.savingTipo.set(true);
    this.tipoError.set('');

    const t = this.editandoTipo()!;
    this.habSvc.updateTipo(t.id, this.tipoForm.value as any).subscribe({
      next: () => {
        this.tipoSuccess.set('Tipo actualizado correctamente. Los precios se propagaron a todas las unidades.');
        this.savingTipo.set(false);
        this.loadTipos();
        this.loadUnidades();
        setTimeout(() => this.editandoTipo.set(null), 1500);
      },
      error: (err) => {
        this.savingTipo.set(false);
        this.tipoError.set(err?.error?.mensaje ?? 'Error al actualizar.');
      },
    });
  }

  // ── Unidades CRUD ──
  editar(h: Habitacion): void {
    this.editando.set(h);
    this.form.patchValue({
      nombre_display: h.nombre_display,
      descripcion: h.descripcion,
      precio: h.precio,
      disponible: h.disponible,
    });
    this.error.set(''); this.success.set('');
    this.imageFile.set(null);
    this.imagePreview.set(null);
  }

  cancelar(): void { 
    this.editando.set(null); 
    this.form.reset(); 
    this.imageFile.set(null);
    this.imagePreview.set(null);
  }

  guardar(): void {
    if (this.form.invalid || !this.editando()) return;
    this.saving.set(true); this.error.set('');
    const h = this.editando()!;
    this.habSvc.update(h.id, this.form.value as any).subscribe({
      next: (updated) => {
        this.habitaciones.update(hs => hs.map(x => x.id === h.id ? updated : x));
        this.success.set('Habitación actualizada.');
        this.saving.set(false);
        if (this.imageFile()) this.subirImagen(h.id);
        else this.editando.set(null);
      },
      error: (err) => { this.saving.set(false); this.error.set(err?.error?.mensaje ?? 'Error al guardar.'); },
    });
  }

  onFileChange(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) {
      this.imageFile.set(f);
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(f);
    }
  }

  subirImagen(id: number): void {
    this.habSvc.uploadImagen(id, this.imageFile()!).subscribe({
      next: () => { 
        this.imageFile.set(null); 
        this.imagePreview.set(null);
        this.editando.set(null); 
        this.loadUnidades(); 
      },
      error: () => { this.editando.set(null); },
    });
  }

  eliminarImagen(idImg: number, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    if (!confirm('¿Seguro de eliminar esta imagen?')) return;
    
    const h = this.editando()!;
    this.habSvc.deleteImagen(h.id, idImg).subscribe({
      next: () => {
        const h2 = { ...h, imagenes: h.imagenes!.filter(i => i.id !== idImg) };
        this.editando.set(h2);
        this.habitaciones.update(hs => hs.map(x => x.id === h.id ? h2 : x));
      },
      error: () => { this.error.set('No se pudo borrar la imagen.'); }
    });
  }
}
