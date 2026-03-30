import { CanActivateFn } from '@angular/router';

// Auth guard disabled - no token authentication
export const authGuard: CanActivateFn = () => {
  return true;
};