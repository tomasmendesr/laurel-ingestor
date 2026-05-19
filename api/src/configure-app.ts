import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Pipes / interceptors / filters compartidos entre `main.ts` y e2e (mismo comportamiento que prod).
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina las propiedades que no están en el DTO
      forbidNonWhitelisted: true, // lanza un error si se envían propiedades que no están en el DTO
      transform: true, // transforma los datos a los tipos del DTO
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor()); // intercepta las peticiones y respuestas
  app.useGlobalFilters(new AllExceptionsFilter()); // intercepta los errores y lanza una respuesta estandarizada
}
