import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums';
import { ROLES_KEY } from '../guards/roles.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
