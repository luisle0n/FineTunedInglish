import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  // Validador para cédula ecuatoriana
  static cedulaEcuatoriana(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cedula = control.value;
      if (!cedula) return null;
      
      // Verificar que tenga 10 dígitos
      if (!/^\d{10}$/.test(cedula)) {
        return { cedulaInvalida: { value: cedula } };
      }
      
      // Algoritmo de validación de cédula ecuatoriana
      const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      const verificador = parseInt(cedula.charAt(9));
      
      let suma = 0;
      for (let i = 0; i < 9; i++) {
        let producto = parseInt(cedula.charAt(i)) * coeficientes[i];
        if (producto >= 10) {
          producto = producto - 9;
        }
        suma += producto;
      }
      
      const residuo = suma % 10;
      const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;
      
      if (digitoVerificador !== verificador) {
        return { cedulaInvalida: { value: cedula } };
      }
      
      return null;
    };
  }
  
  // Validador para email
  static emailValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { emailInvalido: { value: email } };
      }
      
      return null;
    };
  }
  
  // Validador para teléfono
  static telefonoValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const telefono = control.value;
      if (!telefono) return null;
      
      // Acepta formatos: 0991234567, +593991234567, 099-123-4567
      const telefonoRegex = /^(\+593|0)?[9][0-9]{8}$/;
      if (!telefonoRegex.test(telefono.replace(/[\s\-\(\)]/g, ''))) {
        return { telefonoInvalido: { value: telefono } };
      }
      
      return null;
    };
  }
  
  // Validador para contraseña fuerte
  static passwordFuerte(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;
      
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      const errors: ValidationErrors = {};
      
      if (password.length < minLength) {
        errors['passwordCorta'] = { requiredLength: minLength, actualLength: password.length };
      }
      if (!hasUpperCase) {
        errors['sinMayuscula'] = true;
      }
      if (!hasLowerCase) {
        errors['sinMinuscula'] = true;
      }
      if (!hasNumbers) {
        errors['sinNumeros'] = true;
      }
      if (!hasSpecialChar) {
        errors['sinCaracterEspecial'] = true;
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
  
  // Validador para confirmar contraseña
  static confirmarPassword(passwordControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const confirmPassword = control.value;
      const password = passwordControl.value;
      
      if (!confirmPassword || !password) return null;
      
      if (confirmPassword !== password) {
        return { passwordsNoCoinciden: true };
      }
      
      return null;
    };
  }
  
  // Validador para números positivos
  static numeroPositivo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (valor === null || valor === undefined || valor === '') return null;
      
      const numero = Number(valor);
      if (isNaN(numero) || numero <= 0) {
        return { numeroNoPositivo: { value: valor } };
      }
      
      return null;
    };
  }
  
  // Validador para rango de números
  static rangoNumerico(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (valor === null || valor === undefined || valor === '') return null;
      
      const numero = Number(valor);
      if (isNaN(numero) || numero < min || numero > max) {
        return { fueraDeRango: { value: valor, min, max } };
      }
      
      return null;
    };
  }
  
  // Validador para solo letras y espacios
  static soloLetras(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (!valor) return null;
      
      const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!letrasRegex.test(valor)) {
        return { soloLetras: { value: valor } };
      }
      
      return null;
    };
  }
} 