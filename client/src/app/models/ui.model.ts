import { MatSnackBarConfig } from '@angular/material/snack-bar';

export const snackError: MatSnackBarConfig = {
  horizontalPosition: "center",
  verticalPosition: "bottom",
  panelClass: "snack-error",
  duration: 5000
};

export const snackSuccess = { ...snackError, panelClass: "snack-primary" };
