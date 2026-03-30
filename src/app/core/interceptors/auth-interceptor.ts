import { HttpInterceptorFn } from '@angular/common/http';

// Token authentication disabled
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};