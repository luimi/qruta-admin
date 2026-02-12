import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Parse from 'parse';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (Parse.User.current()) {
    return true;
  } else {
    return router.createUrlTree(['/login'])
  }
};
