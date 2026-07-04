import { isDevMode } from '@angular/core';

export const API_BASE_URL = isDevMode()
  ? 'http://localhost:3000/api'
  : 'https://restappbackend.up.railway.app/api';
