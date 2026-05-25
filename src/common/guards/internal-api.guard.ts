import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class InternalApiGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.INTERNAL_API_KEY;
    if (!expected) {
      // Dev convenience: allow when key not configured
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const provided = req.headers['x-internal-api-key'];
    if (provided !== expected) {
      throw new UnauthorizedException('Invalid internal API key');
    }
    return true;
  }
}
