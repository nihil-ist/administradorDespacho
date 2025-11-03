import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ExpedientesService } from '../../services/expedientes.service';
import { FirebaseStorageService, UploadedFileMetadata } from '../../services/firebase-storage.service';
import { ExpedienteEstado, ExpedientePayload } from '../models/expediente.model';

@Component({
  selector: 'app-nuevo-expediente',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-expediente.component.html',
  styleUrl: './nuevo-expediente.component.css'
})
export class NuevoExpedienteComponent {
  expedienteForm: FormGroup;
  selectedFiles: File[] = [];
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal<string | null>(null);
  uploadResults = signal<UploadedFileMetadata[]>([]);

  readonly estadoOpciones: { value: ExpedienteEstado; label: string }[] = [
    { value: 'EXHORTO', label: 'Exhorto' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'TERMINADO', label: 'Terminado' },
    { value: 'ARCHIVADO', label: 'Archivado' },
  ];

  constructor(
    private fb: FormBuilder,
    private expedientesService: ExpedientesService,
    private firebaseStorage: FirebaseStorageService,
    private router: Router
  ) {
    this.expedienteForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(120)]],
      numeroControl: ['', [Validators.required, Validators.maxLength(60)]],
      cliente: ['', [Validators.required, Validators.maxLength(120)]],
      abogadoAsignado: ['', [Validators.required, Validators.maxLength(120)]],
      tipo: ['', [Validators.required, Validators.maxLength(80)]],
      estatus: ['EN_PROCESO', Validators.required],
      fechaApertura: ['', Validators.required],
      fechaAudiencia: [''],
      fechaConclusion: [''],
      descripcion: ['', Validators.maxLength(500)],
      notasInternas: ['', Validators.maxLength(500)],
      etiquetas: [''],
    });
  }

  get formControls() {
    return this.expedienteForm.controls;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      return;
    }

    const nuevosArchivos = Array.from(input.files);
    this.selectedFiles = [...this.selectedFiles, ...nuevosArchivos];
    input.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, idx) => idx !== index);
  }

  private toIsoDate(fecha: string | Date | null | undefined): string | null {
    if (!fecha) {
      return null;
    }

    const dateInstance = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return isNaN(dateInstance.getTime()) ? null : dateInstance.toISOString();
  }

  private buildPayload(): ExpedientePayload {
    const valores = this.expedienteForm.value;
    const etiquetas = valores.etiquetas
      ? valores.etiquetas
          .split(',')
          .map((etiqueta: string) => etiqueta.trim())
          .filter((etiqueta: string) => etiqueta.length > 0)
      : [];

    return {
      titulo: valores.titulo.trim(),
      numeroControl: valores.numeroControl.trim(),
      cliente: valores.cliente.trim(),
      abogadoAsignado: valores.abogadoAsignado.trim(),
      tipo: valores.tipo.trim(),
      estatus: valores.estatus,
      fechaApertura: this.toIsoDate(valores.fechaApertura) as string,
      fechaAudiencia: this.toIsoDate(valores.fechaAudiencia),
      fechaConclusion: this.toIsoDate(valores.fechaConclusion),
      descripcion: valores.descripcion ? valores.descripcion.trim() : null,
      notasInternas: valores.notasInternas ? valores.notasInternas.trim() : null,
      etiquetas,
    };
  }

  async submit(): Promise<void> {
    this.submitError.set(null);
    this.submitSuccess.set(null);

    if (this.expedienteForm.invalid) {
      this.expedienteForm.markAllAsTouched();
      this.submitError.set('Revisa los campos obligatorios antes de continuar.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const payload = this.buildPayload();
      let archivosSubidos: UploadedFileMetadata[] = [];

      if (this.selectedFiles.length > 0) {
        archivosSubidos = await this.firebaseStorage.uploadFiles(
          this.selectedFiles,
          `expedientes/${payload.numeroControl}`
        );
        payload.archivos = archivosSubidos;
        this.uploadResults.set(archivosSubidos);
      }

      const respuesta = await firstValueFrom(this.expedientesService.createExpediente(payload));

      this.submitSuccess.set('Expediente creado correctamente.');
      this.expedienteForm.reset({ estatus: 'EN_PROCESO' });
      this.selectedFiles = [];

      setTimeout(() => {
        this.router.navigate(['/expedientes/lista'], {
          queryParams: { status: payload.estatus ?? 'EN_PROCESO' },
        });
      }, 900);
    } catch (error: any) {
      console.error('Error al guardar el expediente:', error);
      const mensaje = error?.error?.message || 'No se pudo guardar el expediente. Intenta nuevamente.';
      this.submitError.set(mensaje);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancel(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.router.navigate(['/expedientes']);
  }
}
