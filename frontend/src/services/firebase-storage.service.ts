import { Injectable } from '@angular/core';
import { getApps, initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { environment } from '../environments/environment';

export interface UploadedFileMetadata {
  nombreOriginal: string;
  url: string;
  storagePath: string;
  contentType?: string | null;
  size?: number | null;
}

@Injectable({ providedIn: 'root' })
export class FirebaseStorageService {
  private readonly app = getApps().length > 0 ? getApps()[0] : initializeApp(environment.firebase);
  private readonly storage = getStorage(this.app);

  constructor() {
    if (!environment.firebase?.apiKey || environment.firebase.apiKey.startsWith('TU_')) {
      console.warn('Firebase Storage no está configurado. Agrega tus credenciales en environment.ts');
    }
  }

  async uploadFile(file: File, folder = 'expedientes'): Promise<UploadedFileMetadata> {
    const sanitizedName = file.name.replace(/\s+/g, '_');
    const uniqueId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(36);
    const storagePath = `${folder}/${uniqueId}_${sanitizedName}`;
    const fileRef = ref(this.storage, storagePath);

    const snapshot = await uploadBytes(fileRef, file, { contentType: file.type });
    const url = await getDownloadURL(snapshot.ref);

    return {
      nombreOriginal: file.name,
      url,
      storagePath,
      contentType: file.type,
      size: file.size,
    };
  }

  async uploadFiles(files: File[], folder = 'expedientes'): Promise<UploadedFileMetadata[]> {
    const uploads = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploads);
  }

  async deleteFile(storagePath: string): Promise<void> {
    const fileRef = ref(this.storage, storagePath);
    await deleteObject(fileRef);
  }
}
