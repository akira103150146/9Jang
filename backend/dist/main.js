/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/account/account.controller.ts":
/*!*******************************************!*\
  !*** ./src/account/account.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const account_service_1 = __webpack_require__(/*! ./account.service */ "./src/account/account.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const shared_2 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ./guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let AccountController = class AccountController {
    constructor(accountService) {
        this.accountService = accountService;
    }
    async login(loginDto) {
        return this.accountService.login(loginDto);
    }
    async logout(_req) {
        return { message: '登出成功' };
    }
    async refreshToken(refreshTokenDto) {
        return this.accountService.refreshToken(refreshTokenDto);
    }
    async getCurrentUser(req) {
        return this.accountService.getCurrentUser(req.user.id);
    }
    async getCurrentRole(req, tempRole) {
        return this.accountService.getCurrentRole(req.user.id, tempRole);
    }
    async switchRole(req, body) {
        return this.accountService.switchRole(req.user.id, body.role);
    }
    async resetRole(req) {
        return this.accountService.resetRole(req.user.id);
    }
    async impersonateUser(req, body) {
        return this.accountService.impersonateUser(req.user.id, body.user_id);
    }
    async changePassword(req, changePasswordDto) {
        await this.accountService.changePassword(req.user.id, changePasswordDto);
        return { message: '密碼修改成功' };
    }
    async getUsers(page = 1, pageSize = 10) {
        return this.accountService.getUsers(page, pageSize);
    }
    async getUser(id) {
        return this.accountService.getUserById(id);
    }
    async getRoles(page = 1, pageSize = 10) {
        return this.accountService.getRoles(page, pageSize);
    }
    async getAuditLogs(page = 1, pageSize = 10) {
        return this.accountService.getAuditLogs(page, pageSize);
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_2.LoginRequestSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof shared_1.LoginRequestDto !== "undefined" && shared_1.LoginRequestDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AccountController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('token/refresh'),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_2.RefreshTokenRequestSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.RefreshTokenRequestDto !== "undefined" && shared_1.RefreshTokenRequestDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AccountController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('users/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AccountController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('current-role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('temp_role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _j : Object, String]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AccountController.prototype, "getCurrentRole", null);
__decorate([
    (0, common_1.Post)('switch-role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _l : Object, Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], AccountController.prototype, "switchRole", null);
__decorate([
    (0, common_1.Post)('reset-role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _o : Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], AccountController.prototype, "resetRole", null);
__decorate([
    (0, common_1.Post)('impersonate-user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_q = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _q : Object, Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], AccountController.prototype, "impersonateUser", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_2.ChangePasswordRequestSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_s = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _s : Object, typeof (_t = typeof shared_1.ChangePasswordRequestDto !== "undefined" && shared_1.ChangePasswordRequestDto) === "function" ? _t : Object]),
    __metadata("design:returntype", typeof (_u = typeof Promise !== "undefined" && Promise) === "function" ? _u : Object)
], AccountController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_v = typeof Promise !== "undefined" && Promise) === "function" ? _v : Object)
], AccountController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAuditLogs", null);
exports.AccountController = AccountController = __decorate([
    (0, common_1.Controller)('account'),
    __metadata("design:paramtypes", [typeof (_a = typeof account_service_1.AccountService !== "undefined" && account_service_1.AccountService) === "function" ? _a : Object])
], AccountController);


/***/ }),

/***/ "./src/account/account.module.ts":
/*!***************************************!*\
  !*** ./src/account/account.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const account_controller_1 = __webpack_require__(/*! ./account.controller */ "./src/account/account.controller.ts");
const account_service_1 = __webpack_require__(/*! ./account.service */ "./src/account/account.service.ts");
const jwt_strategy_1 = __webpack_require__(/*! ./strategies/jwt.strategy */ "./src/account/strategies/jwt.strategy.ts");
let AccountModule = class AccountModule {
};
exports.AccountModule = AccountModule;
exports.AccountModule = AccountModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'your-secret-key',
                    signOptions: {
                        expiresIn: configService.get('JWT_ACCESS_TOKEN_LIFETIME_HOURS', '1h'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [account_controller_1.AccountController],
        providers: [account_service_1.AccountService, jwt_strategy_1.JwtStrategy],
        exports: [account_service_1.AccountService],
    })
], AccountModule);


/***/ }),

/***/ "./src/account/account.service.ts":
/*!****************************************!*\
  !*** ./src/account/account.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
let AccountService = class AccountService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        let user = await this.prisma.accountCustomUser.findFirst({
            where: {
                OR: [
                    { email: loginDto.email },
                    { username: loginDto.email },
                ],
            },
            include: {
                customRole: {
                    include: {
                        permissions: true,
                    },
                },
                studentProfile: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('帳號或密碼錯誤');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('帳號或密碼錯誤');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('帳號已被停用');
        }
        const payload = { sub: user.id, username: user.username };
        const access = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refresh = this.jwtService.sign(payload, { expiresIn: '7d' });
        return {
            access,
            refresh,
            user: this.toUserDto(user),
        };
    }
    async getCurrentUser(userId) {
        const user = await this.prisma.accountCustomUser.findUnique({
            where: { id: userId },
            include: {
                customRole: {
                    include: {
                        permissions: true,
                    },
                },
                studentProfile: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('用戶不存在');
        }
        return this.toUserDto(user);
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.prisma.accountCustomUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('用戶不存在');
        }
        const isOldPasswordValid = await bcrypt.compare(changePasswordDto.old_password, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.UnauthorizedException('舊密碼錯誤');
        }
        const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 10);
        await this.prisma.accountCustomUser.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
        });
    }
    async refreshToken(refreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refresh);
            const newAccess = this.jwtService.sign({ sub: payload.sub, username: payload.username }, { expiresIn: '1h' });
            return {
                access: newAccess,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getUsers(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.accountCustomUser.findMany({
                skip,
                take: pageSize,
                include: {
                    customRole: {
                        include: {
                            permissions: true,
                        },
                    },
                    studentProfile: true,
                },
            }),
            this.prisma.accountCustomUser.count(),
        ]);
        return {
            count,
            next: skip + pageSize < count ? page + 1 : null,
            previous: page > 1 ? page - 1 : null,
            results: results.map((user) => this.toUserDto(user)),
        };
    }
    async getUserById(id) {
        const user = await this.prisma.accountCustomUser.findUnique({
            where: { id },
            include: {
                customRole: {
                    include: {
                        permissions: true,
                    },
                },
                studentProfile: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.toUserDto(user);
    }
    async getRoles(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.accountRole.findMany({
                skip,
                take: pageSize,
                include: {
                    permissions: true,
                },
            }),
            this.prisma.accountRole.count(),
        ]);
        return {
            count,
            next: skip + pageSize < count ? page + 1 : null,
            previous: page > 1 ? page - 1 : null,
            results: results.map((role) => ({
                id: role.id,
                code: role.code,
                name: role.name,
                description: role.description,
                is_active: role.isActive,
                created_at: role.createdAt.toISOString(),
                updated_at: role.updatedAt.toISOString(),
                permissions: role.permissions.map((p) => ({
                    id: p.id,
                    role: p.roleId,
                    permission_type: p.permissionType,
                    resource: p.resource,
                    method: p.method,
                    created_at: p.createdAt.toISOString(),
                })),
                permission_count: role.permissions.length,
            })),
        };
    }
    async getAuditLogs(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.accountAuditLog.findMany({
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.accountAuditLog.count(),
        ]);
        return {
            count,
            next: skip + pageSize < count ? page + 1 : null,
            previous: page > 1 ? page - 1 : null,
            results: results.map((log) => ({
                id: log.id,
                user: log.userId,
                role: log.roleId,
                impersonated_by: log.impersonatedById,
                action_type: log.actionType,
                resource_type: log.resourceType,
                resource_id: log.resourceId,
                resource_name: log.resourceName,
                description: log.description,
                ip_address: log.ipAddress,
                user_agent: log.userAgent,
                request_data: log.requestData,
                response_status: log.responseStatus,
                created_at: log.createdAt.toISOString(),
            })),
        };
    }
    toUserDto(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            role: user.role,
            role_display: this.getRoleDisplay(user.role),
            custom_role: user.customRoleId,
            custom_role_name: user.customRole?.name || null,
            is_staff: user.isStaff,
            is_active: user.isActive,
            must_change_password: user.mustChangePassword,
            student_id: user.studentProfile?.studentId || null,
        };
    }
    getRoleDisplay(role) {
        const roleMap = {
            ADMIN: '系統管理員',
            TEACHER: '老師',
            STUDENT: '學生',
            ACCOUNTANT: '會計',
        };
        return roleMap[role] || role;
    }
    async switchRole(userId, targetRole) {
        const user = await this.prisma.accountCustomUser.findUnique({
            where: { id: userId },
        });
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('只有管理員可以切換角色');
        }
        const validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'];
        if (!validRoles.includes(targetRole)) {
            throw new common_1.BadRequestException(`無效的角色。有效角色：${validRoles.join(', ')}`);
        }
        return {
            message: `已切換到 ${this.getRoleDisplay(targetRole)} 視角`,
            temp_role: targetRole,
            original_role: user.role,
        };
    }
    async resetRole(userId) {
        const user = await this.prisma.accountCustomUser.findUnique({
            where: { id: userId },
        });
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('只有管理員可以重置角色');
        }
        return {
            message: `已重置回 ${this.getRoleDisplay(user.role)} 視角`,
            current_role: user.role,
        };
    }
    async getCurrentRole(userId, tempRole) {
        const user = await this.prisma.accountCustomUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'];
        let effectiveTempRole = null;
        if (tempRole && validRoles.includes(tempRole)) {
            if (user.role === 'ADMIN') {
                effectiveTempRole = tempRole;
            }
        }
        const originalRole = user.role;
        const effectiveRole = effectiveTempRole || originalRole;
        return {
            original_role: originalRole,
            original_role_display: this.getRoleDisplay(originalRole),
            temp_role: effectiveTempRole,
            temp_role_display: effectiveTempRole ? this.getRoleDisplay(effectiveTempRole) : null,
            effective_role: effectiveRole,
            effective_role_display: this.getRoleDisplay(effectiveRole),
        };
    }
    async impersonateUser(adminUserId, targetUserId) {
        const adminUser = await this.prisma.accountCustomUser.findUnique({
            where: { id: adminUserId },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('只有管理員可以模擬其他用戶');
        }
        const targetUser = await this.prisma.accountCustomUser.findUnique({
            where: { id: targetUserId },
            include: {
                customRole: {
                    include: {
                        permissions: true,
                    },
                },
                studentProfile: true,
            },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('目標用戶不存在');
        }
        const payload = { sub: targetUser.id, username: targetUser.username };
        const access = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refresh = this.jwtService.sign(payload, { expiresIn: '7d' });
        const userDto = {
            id: targetUser.id,
            username: targetUser.username,
            email: targetUser.email,
            first_name: targetUser.firstName || '',
            last_name: targetUser.lastName || '',
            role: targetUser.role,
            custom_role: targetUser.customRoleId,
            custom_role_name: targetUser.customRole?.name || null,
            is_staff: targetUser.isStaff,
            is_active: targetUser.isActive,
            must_change_password: targetUser.mustChangePassword,
            student_id: targetUser.studentProfile?.studentId || null,
        };
        return {
            user: userDto,
            access,
            refresh,
            message: `已切換為 ${targetUser.username} 身分`,
        };
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], AccountService);


/***/ }),

/***/ "./src/account/guards/jwt-auth.guard.ts":
/*!**********************************************!*\
  !*** ./src/account/guards/jwt-auth.guard.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),

/***/ "./src/account/strategies/jwt.strategy.ts":
/*!************************************************!*\
  !*** ./src/account/strategies/jwt.strategy.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key',
        });
        this.configService = configService;
    }
    async validate(payload) {
        if (!payload.sub || !payload.username) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        return { id: payload.sub, username: payload.username };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const prisma_module_1 = __webpack_require__(/*! ./prisma/prisma.module */ "./src/prisma/prisma.module.ts");
const account_module_1 = __webpack_require__(/*! ./account/account.module */ "./src/account/account.module.ts");
const cramschool_module_1 = __webpack_require__(/*! ./cramschool/cramschool.module */ "./src/cramschool/cramschool.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            account_module_1.AccountModule,
            cramschool_module_1.CramschoolModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./src/common/filters/http-exception.filter.ts":
/*!*****************************************************!*\
  !*** ./src/common/filters/http-exception.filter.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpExceptionFilter = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const zod_1 = __webpack_require__(/*! zod */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.cjs");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            message = exception.getResponse();
        }
        else if (exception instanceof zod_1.ZodError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            const errors = exception.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            message = {
                detail: '驗證失敗',
                errors,
            };
        }
        const errorResponse = {
            detail: typeof message === 'string' ? message : message.detail || message.message || 'An error occurred',
        };
        if (typeof message === 'object' && message !== null) {
            if (message.errors) {
                errorResponse.errors = message.errors;
            }
            Object.keys(message).forEach((key) => {
                if (key !== 'detail' && key !== 'message') {
                    errorResponse[key] = message[key];
                }
            });
        }
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);


/***/ }),

/***/ "./src/common/interceptors/audit-log.interceptor.ts":
/*!**********************************************************!*\
  !*** ./src/common/interceptors/audit-log.interceptor.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuditLogInterceptor = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
let AuditLogInterceptor = class AuditLogInterceptor {
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user, ip, headers } = request;
        if (url.includes('/login') || url.includes('/token/refresh')) {
            return next.handle();
        }
        const _startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: async (response) => {
                const statusCode = response?.statusCode || 200;
                await this.logAudit(user, method, url, body, statusCode, ip, headers['user-agent']);
            },
            error: async (error) => {
                const statusCode = error?.status || 500;
                await this.logAudit(user, method, url, body, statusCode, ip, headers['user-agent']);
            },
        }));
    }
    async logAudit(user, method, url, body, statusCode, ip, userAgent) {
        if (!user) {
            return;
        }
        try {
            let actionType = 'other';
            if (method === 'POST') {
                actionType = 'create';
            }
            else if (method === 'PUT' || method === 'PATCH') {
                actionType = 'update';
            }
            else if (method === 'DELETE') {
                actionType = 'delete';
            }
            else if (method === 'GET') {
                actionType = 'view';
            }
            const resourceType = this.extractResourceType(url);
            const userRecord = await this.prisma.accountCustomUser.findUnique({
                where: { id: user.id },
                include: { customRole: true },
            });
            await this.prisma.accountAuditLog.create({
                data: {
                    userId: user.id,
                    roleId: userRecord?.customRoleId || null,
                    actionType,
                    resourceType,
                    resourceId: this.extractResourceId(url, body),
                    resourceName: this.extractResourceName(body),
                    description: `${method} ${url}`,
                    ipAddress: ip,
                    userAgent,
                    requestData: body || {},
                    responseStatus: statusCode,
                },
            });
        }
        catch (error) {
            console.error('Failed to log audit:', error);
        }
    }
    extractResourceType(url) {
        const parts = url.split('/').filter((p) => p);
        if (parts.length >= 2) {
            return parts[parts.length - 2];
        }
        return 'unknown';
    }
    extractResourceId(url, body) {
        const parts = url.split('/').filter((p) => p);
        const lastPart = parts[parts.length - 1];
        if (lastPart && !isNaN(parseInt(lastPart))) {
            return lastPart;
        }
        return body?.id?.toString() || null;
    }
    extractResourceName(body) {
        return body?.name || body?.title || body?.course_name || null;
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AuditLogInterceptor);


/***/ }),

/***/ "./src/common/utils/pagination.util.ts":
/*!*********************************************!*\
  !*** ./src/common/utils/pagination.util.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createPaginatedResponse = createPaginatedResponse;
function createPaginatedResponse(results, count, page, pageSize) {
    return {
        count,
        next: (page - 1) * pageSize + results.length < count ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
        results,
    };
}


/***/ }),

/***/ "./src/cramschool/controllers/attendances.controller.ts":
/*!**************************************************************!*\
  !*** ./src/cramschool/controllers/attendances.controller.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendancesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const attendances_service_1 = __webpack_require__(/*! ../services/attendances.service */ "./src/cramschool/services/attendances.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let AttendancesController = class AttendancesController {
    constructor(attendancesService) {
        this.attendancesService = attendancesService;
    }
    async getAttendances(includeDeleted = 'false', page = 1, pageSize = 10) {
        return this.attendancesService.getAttendances(includeDeleted === 'true', page, pageSize);
    }
    async getAttendance(id) {
        return this.attendancesService.getAttendance(id);
    }
    async createAttendance(createDto) {
        return this.attendancesService.createAttendance(createDto);
    }
    async updateAttendance(id, updateDto) {
        return this.attendancesService.updateAttendance(id, updateDto);
    }
    async deleteAttendance(id) {
        return this.attendancesService.deleteAttendance(id);
    }
    async restoreAttendance(id) {
        return this.attendancesService.restoreAttendance(id);
    }
};
exports.AttendancesController = AttendancesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('include_deleted')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AttendancesController.prototype, "getAttendances", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AttendancesController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateAttendanceSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateAttendanceDto !== "undefined" && shared_1.CreateAttendanceDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AttendancesController.prototype, "createAttendance", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateAttendanceSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateAttendanceDto !== "undefined" && shared_1.UpdateAttendanceDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AttendancesController.prototype, "updateAttendance", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AttendancesController.prototype, "deleteAttendance", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AttendancesController.prototype, "restoreAttendance", null);
exports.AttendancesController = AttendancesController = __decorate([
    (0, common_1.Controller)('cramschool/attendances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof attendances_service_1.AttendancesService !== "undefined" && attendances_service_1.AttendancesService) === "function" ? _a : Object])
], AttendancesController);


/***/ }),

/***/ "./src/cramschool/controllers/content-templates.controller.ts":
/*!********************************************************************!*\
  !*** ./src/cramschool/controllers/content-templates.controller.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentTemplatesController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const content_templates_service_1 = __webpack_require__(/*! ../services/content-templates.service */ "./src/cramschool/services/content-templates.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let ContentTemplatesController = class ContentTemplatesController {
    constructor(contentTemplatesService, prisma) {
        this.contentTemplatesService = contentTemplatesService;
        this.prisma = prisma;
    }
    async getContentTemplates(req, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.contentTemplatesService.getContentTemplates(user.id, userRole, page, pageSize);
    }
    async getContentTemplate(req, id) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.contentTemplatesService.getContentTemplate(id, user.id, userRole);
    }
    async createContentTemplate(req, createDto) {
        const user = req.user;
        return this.contentTemplatesService.createContentTemplate(createDto, user.id);
    }
    async updateContentTemplate(req, id, updateDto) {
        const user = req.user;
        return this.contentTemplatesService.updateContentTemplate(id, updateDto, user.id);
    }
    async deleteContentTemplate(req, id) {
        const user = req.user;
        return this.contentTemplatesService.deleteContentTemplate(id, user.id);
    }
};
exports.ContentTemplatesController = ContentTemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ContentTemplatesController.prototype, "getContentTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _d : Object, Number]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], ContentTemplatesController.prototype, "getContentTemplate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateContentTemplateSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _f : Object, typeof (_g = typeof shared_1.CreateContentTemplateDto !== "undefined" && shared_1.CreateContentTemplateDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], ContentTemplatesController.prototype, "createContentTemplate", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateContentTemplateSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _j : Object, Number, typeof (_k = typeof shared_1.UpdateContentTemplateDto !== "undefined" && shared_1.UpdateContentTemplateDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], ContentTemplatesController.prototype, "updateContentTemplate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _m : Object, Number]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], ContentTemplatesController.prototype, "deleteContentTemplate", null);
exports.ContentTemplatesController = ContentTemplatesController = __decorate([
    (0, common_1.Controller)('cramschool/content-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof content_templates_service_1.ContentTemplatesService !== "undefined" && content_templates_service_1.ContentTemplatesService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], ContentTemplatesController);


/***/ }),

/***/ "./src/cramschool/controllers/courses.controller.ts":
/*!**********************************************************!*\
  !*** ./src/cramschool/controllers/courses.controller.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoursesController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const courses_service_1 = __webpack_require__(/*! ../services/courses.service */ "./src/cramschool/services/courses.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let CoursesController = class CoursesController {
    constructor(coursesService, prisma) {
        this.coursesService = coursesService;
        this.prisma = prisma;
    }
    async getCourses(page = 1, pageSize = 10) {
        return this.coursesService.getCourses(page, pageSize);
    }
    async getCourse(id) {
        return this.coursesService.getCourse(id);
    }
    async createCourse(createDto) {
        return this.coursesService.createCourse(createDto);
    }
    async updateCourse(id, updateDto) {
        return this.coursesService.updateCourse(id, updateDto);
    }
    async deleteCourse(id) {
        return this.coursesService.deleteCourse(id);
    }
    async getStudentStatus(id) {
        return this.coursesService.getStudentStatus(id);
    }
    async getResources(id, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.coursesService.getResources(id, user.id, userRecord?.role || 'STUDENT');
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CoursesController.prototype, "getCourse", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateCourseSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof shared_1.CreateCourseDto !== "undefined" && shared_1.CreateCourseDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateCourseSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof shared_1.UpdateCourseDto !== "undefined" && shared_1.UpdateCourseDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CoursesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], CoursesController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)(':id/student-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], CoursesController.prototype, "getStudentStatus", null);
__decorate([
    (0, common_1.Get)(':id/resources'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_k = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], CoursesController.prototype, "getResources", null);
exports.CoursesController = CoursesController = __decorate([
    (0, common_1.Controller)('cramschool/courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof courses_service_1.CoursesService !== "undefined" && courses_service_1.CoursesService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], CoursesController);


/***/ }),

/***/ "./src/cramschool/controllers/enrollment-periods.controller.ts":
/*!*********************************************************************!*\
  !*** ./src/cramschool/controllers/enrollment-periods.controller.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnrollmentPeriodsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const enrollment_periods_service_1 = __webpack_require__(/*! ../services/enrollment-periods.service */ "./src/cramschool/services/enrollment-periods.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let EnrollmentPeriodsController = class EnrollmentPeriodsController {
    constructor(enrollmentPeriodsService) {
        this.enrollmentPeriodsService = enrollmentPeriodsService;
    }
    async getPeriods(enrollmentId) {
        return this.enrollmentPeriodsService.getPeriods(enrollmentId);
    }
    async getPeriod(id) {
        return this.enrollmentPeriodsService.getPeriod(id);
    }
    async createPeriod(createDto) {
        return this.enrollmentPeriodsService.createPeriod(createDto);
    }
    async updatePeriod(id, updateDto) {
        return this.enrollmentPeriodsService.updatePeriod(id, updateDto);
    }
    async deletePeriod(id) {
        return this.enrollmentPeriodsService.deletePeriod(id);
    }
};
exports.EnrollmentPeriodsController = EnrollmentPeriodsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('enrollment', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EnrollmentPeriodsController.prototype, "getPeriods", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], EnrollmentPeriodsController.prototype, "getPeriod", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateEnrollmentPeriodSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateEnrollmentPeriodDto !== "undefined" && shared_1.CreateEnrollmentPeriodDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], EnrollmentPeriodsController.prototype, "createPeriod", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateEnrollmentPeriodSchema.partial()))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof Partial !== "undefined" && Partial) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], EnrollmentPeriodsController.prototype, "updatePeriod", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], EnrollmentPeriodsController.prototype, "deletePeriod", null);
exports.EnrollmentPeriodsController = EnrollmentPeriodsController = __decorate([
    (0, common_1.Controller)('cramschool/enrollment-periods'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof enrollment_periods_service_1.EnrollmentPeriodsService !== "undefined" && enrollment_periods_service_1.EnrollmentPeriodsService) === "function" ? _a : Object])
], EnrollmentPeriodsController);


/***/ }),

/***/ "./src/cramschool/controllers/enrollments.controller.ts":
/*!**************************************************************!*\
  !*** ./src/cramschool/controllers/enrollments.controller.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnrollmentsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const enrollments_service_1 = __webpack_require__(/*! ../services/enrollments.service */ "./src/cramschool/services/enrollments.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let EnrollmentsController = class EnrollmentsController {
    constructor(enrollmentsService) {
        this.enrollmentsService = enrollmentsService;
    }
    async getEnrollments(page = 1, pageSize = 10) {
        return this.enrollmentsService.getEnrollments(page, pageSize);
    }
    async getEnrollment(id) {
        return this.enrollmentsService.getEnrollment(id);
    }
    async createEnrollment(createDto) {
        return this.enrollmentsService.createEnrollment(createDto);
    }
    async updateEnrollment(id, updateDto) {
        return this.enrollmentsService.updateEnrollment(id, updateDto);
    }
    async deleteEnrollment(id) {
        return this.enrollmentsService.deleteEnrollment(id);
    }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "getEnrollments", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], EnrollmentsController.prototype, "getEnrollment", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentEnrollmentSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateStudentEnrollmentDto !== "undefined" && shared_1.CreateStudentEnrollmentDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], EnrollmentsController.prototype, "createEnrollment", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentEnrollmentSchema.partial()))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof Partial !== "undefined" && Partial) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], EnrollmentsController.prototype, "updateEnrollment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], EnrollmentsController.prototype, "deleteEnrollment", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, common_1.Controller)('cramschool/enrollments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof enrollments_service_1.EnrollmentsService !== "undefined" && enrollments_service_1.EnrollmentsService) === "function" ? _a : Object])
], EnrollmentsController);


/***/ }),

/***/ "./src/cramschool/controllers/error-log-images.controller.ts":
/*!*******************************************************************!*\
  !*** ./src/cramschool/controllers/error-log-images.controller.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorLogImagesController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const error_log_images_service_1 = __webpack_require__(/*! ../services/error-log-images.service */ "./src/cramschool/services/error-log-images.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let ErrorLogImagesController = class ErrorLogImagesController {
    constructor(errorLogImagesService, prisma) {
        this.errorLogImagesService = errorLogImagesService;
        this.prisma = prisma;
    }
    async getErrorLogImages(req, errorLogId, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (userRole === 'ACCOUNTANT' || userRole === 'STUDENT') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        return this.errorLogImagesService.getErrorLogImages(errorLogId, page, pageSize);
    }
    async getErrorLogImage(id) {
        return this.errorLogImagesService.getErrorLogImage(id);
    }
    async createErrorLogImage(createDto) {
        return this.errorLogImagesService.createErrorLogImage(createDto);
    }
    async updateErrorLogImage(id, updateDto) {
        return this.errorLogImagesService.updateErrorLogImage(id, updateDto);
    }
    async deleteErrorLogImage(id) {
        return this.errorLogImagesService.deleteErrorLogImage(id);
    }
};
exports.ErrorLogImagesController = ErrorLogImagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('error_log', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ErrorLogImagesController.prototype, "getErrorLogImages", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ErrorLogImagesController.prototype, "getErrorLogImage", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateErrorLogImageSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.CreateErrorLogImageDto !== "undefined" && shared_1.CreateErrorLogImageDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], ErrorLogImagesController.prototype, "createErrorLogImage", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateErrorLogImageSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.UpdateErrorLogImageDto !== "undefined" && shared_1.UpdateErrorLogImageDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], ErrorLogImagesController.prototype, "updateErrorLogImage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], ErrorLogImagesController.prototype, "deleteErrorLogImage", null);
exports.ErrorLogImagesController = ErrorLogImagesController = __decorate([
    (0, common_1.Controller)('cramschool/error-log-images'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof error_log_images_service_1.ErrorLogImagesService !== "undefined" && error_log_images_service_1.ErrorLogImagesService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], ErrorLogImagesController);


/***/ }),

/***/ "./src/cramschool/controllers/error-logs.controller.ts":
/*!*************************************************************!*\
  !*** ./src/cramschool/controllers/error-logs.controller.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorLogsController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const error_logs_service_1 = __webpack_require__(/*! ../services/error-logs.service */ "./src/cramschool/services/error-logs.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let ErrorLogsController = class ErrorLogsController {
    constructor(errorLogsService, prisma) {
        this.errorLogsService = errorLogsService;
        this.prisma = prisma;
    }
    async getErrorLogs(req, includeDeleted = 'false', studentId, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.errorLogsService.getErrorLogs(user.id, userRole, includeDeleted === 'true', studentId, page, pageSize);
    }
    async getErrorLog(id) {
        return this.errorLogsService.getErrorLog(id);
    }
    async createErrorLog(createDto) {
        return this.errorLogsService.createErrorLog(createDto);
    }
    async updateErrorLog(id, updateDto) {
        return this.errorLogsService.updateErrorLog(id, updateDto);
    }
    async deleteErrorLog(id) {
        return this.errorLogsService.deleteErrorLog(id);
    }
    async restoreErrorLog(id) {
        return this.errorLogsService.restoreErrorLog(id);
    }
    async importToQuestionBank(req, id) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (userRole === 'ACCOUNTANT') {
            throw new Error('會計不可匯入題庫');
        }
        if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
            throw new Error('無權限');
        }
        return this.errorLogsService.importToQuestionBank(id, user.id);
    }
    async uploadImages(req, id, files) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (userRole === 'STUDENT') {
            throw new Error('學生不可上傳學生管理端錯題圖片');
        }
        if (userRole !== 'ADMIN' && userRole !== 'TEACHER' && userRole !== 'ACCOUNTANT') {
            throw new Error('無權限');
        }
        if (!files || files.length === 0) {
            throw new Error('沒有提供圖片');
        }
        return this.errorLogsService.uploadImages(id, files);
    }
    async reorderImages(req, id, body) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (userRole === 'STUDENT') {
            throw new Error('學生不可操作');
        }
        if (userRole !== 'ADMIN' && userRole !== 'TEACHER' && userRole !== 'ACCOUNTANT') {
            throw new Error('無權限');
        }
        if (!body.image_ids || !Array.isArray(body.image_ids) || body.image_ids.length === 0) {
            throw new Error('請提供 image_ids');
        }
        return this.errorLogsService.reorderImages(id, body.image_ids);
    }
};
exports.ErrorLogsController = ErrorLogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('include_deleted')),
    __param(2, (0, common_1.Query)('student', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(4, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ErrorLogsController.prototype, "getErrorLogs", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ErrorLogsController.prototype, "getErrorLog", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateErrorLogSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.CreateErrorLogDto !== "undefined" && shared_1.CreateErrorLogDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], ErrorLogsController.prototype, "createErrorLog", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateErrorLogSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.UpdateErrorLogDto !== "undefined" && shared_1.UpdateErrorLogDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], ErrorLogsController.prototype, "updateErrorLog", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], ErrorLogsController.prototype, "deleteErrorLog", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], ErrorLogsController.prototype, "restoreErrorLog", null);
__decorate([
    (0, common_1.Post)(':id/import-to-question-bank'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _l : Object, Number]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], ErrorLogsController.prototype, "importToQuestionBank", null);
__decorate([
    (0, common_1.Post)(':id/upload-images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _o : Object, Number, Array]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], ErrorLogsController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Post)(':id/reorder-images'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_q = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _q : Object, Number, Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], ErrorLogsController.prototype, "reorderImages", null);
exports.ErrorLogsController = ErrorLogsController = __decorate([
    (0, common_1.Controller)('cramschool/error-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof error_logs_service_1.ErrorLogsService !== "undefined" && error_logs_service_1.ErrorLogsService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], ErrorLogsController);


/***/ }),

/***/ "./src/cramschool/controllers/fees.controller.ts":
/*!*******************************************************!*\
  !*** ./src/cramschool/controllers/fees.controller.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FeesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const fees_service_1 = __webpack_require__(/*! ../services/fees.service */ "./src/cramschool/services/fees.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let FeesController = class FeesController {
    constructor(feesService) {
        this.feesService = feesService;
    }
    async getFees(page = 1, pageSize = 10, studentId, includeDeleted) {
        return this.feesService.getFees(page, pageSize, studentId, includeDeleted === 'true');
    }
    async getFee(id) {
        return this.feesService.getFee(id);
    }
    async createFee(createDto) {
        return this.feesService.createFee(createDto);
    }
    async updateFee(id, updateDto) {
        return this.feesService.updateFee(id, updateDto);
    }
    async deleteFee(id) {
        await this.feesService.deleteFee(id);
        return { message: '費用記錄已刪除' };
    }
    async batchUpdateStatus(batchUpdateDto) {
        return this.feesService.batchUpdateStatus(batchUpdateDto);
    }
};
exports.FeesController = FeesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('student', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('include_deleted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "getFees", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "getFee", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateFeeSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof shared_1.CreateFeeDto !== "undefined" && shared_1.CreateFeeDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "createFee", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateFeeSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof shared_1.UpdateFeeDto !== "undefined" && shared_1.UpdateFeeDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "updateFee", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "deleteFee", null);
__decorate([
    (0, common_1.Post)('batch-update'),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.BatchUpdateFeeStatusSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof shared_1.BatchUpdateFeeStatusDto !== "undefined" && shared_1.BatchUpdateFeeStatusDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], FeesController.prototype, "batchUpdateStatus", null);
exports.FeesController = FeesController = __decorate([
    (0, common_1.Controller)('cramschool/fees'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof fees_service_1.FeesService !== "undefined" && fees_service_1.FeesService) === "function" ? _a : Object])
], FeesController);


/***/ }),

/***/ "./src/cramschool/controllers/group-orders.controller.ts":
/*!***************************************************************!*\
  !*** ./src/cramschool/controllers/group-orders.controller.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupOrdersController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const group_orders_service_1 = __webpack_require__(/*! ../services/group-orders.service */ "./src/cramschool/services/group-orders.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let GroupOrdersController = class GroupOrdersController {
    constructor(groupOrdersService, prisma) {
        this.groupOrdersService = groupOrdersService;
        this.prisma = prisma;
    }
    async getGroupOrders(req, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        if (userRecord?.role === 'ADMIN') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        return this.groupOrdersService.getGroupOrders(page, pageSize);
    }
    async getGroupOrder(id) {
        return this.groupOrdersService.getGroupOrder(id);
    }
    async createGroupOrder(req, createDto) {
        const user = req.user;
        return this.groupOrdersService.createGroupOrder(createDto, user.id);
    }
    async updateGroupOrder(id, updateDto) {
        return this.groupOrdersService.updateGroupOrder(id, updateDto);
    }
    async deleteGroupOrder(id) {
        return this.groupOrdersService.deleteGroupOrder(id);
    }
    async completeGroupOrder(req, id) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.groupOrdersService.completeGroupOrder(id, user.id, userRole);
    }
};
exports.GroupOrdersController = GroupOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, Number, Number]),
    __metadata("design:returntype", Promise)
], GroupOrdersController.prototype, "getGroupOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], GroupOrdersController.prototype, "getGroupOrder", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateGroupOrderSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _e : Object, typeof (_f = typeof shared_1.CreateGroupOrderDto !== "undefined" && shared_1.CreateGroupOrderDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], GroupOrdersController.prototype, "createGroupOrder", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateGroupOrderSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof shared_1.UpdateGroupOrderDto !== "undefined" && shared_1.UpdateGroupOrderDto) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], GroupOrdersController.prototype, "updateGroupOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], GroupOrdersController.prototype, "deleteGroupOrder", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _l : Object, Number]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], GroupOrdersController.prototype, "completeGroupOrder", null);
exports.GroupOrdersController = GroupOrdersController = __decorate([
    (0, common_1.Controller)('cramschool/group-orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof group_orders_service_1.GroupOrdersService !== "undefined" && group_orders_service_1.GroupOrdersService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], GroupOrdersController);


/***/ }),

/***/ "./src/cramschool/controllers/hashtags.controller.ts":
/*!***********************************************************!*\
  !*** ./src/cramschool/controllers/hashtags.controller.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HashtagsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const hashtags_service_1 = __webpack_require__(/*! ../services/hashtags.service */ "./src/cramschool/services/hashtags.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let HashtagsController = class HashtagsController {
    constructor(hashtagsService) {
        this.hashtagsService = hashtagsService;
    }
    async getHashtags(page = 1, pageSize = 10) {
        return this.hashtagsService.getHashtags(page, pageSize);
    }
    async getHashtag(id) {
        return this.hashtagsService.getHashtag(id);
    }
    async createHashtag(createDto) {
        return this.hashtagsService.createHashtag(createDto);
    }
    async updateHashtag(id, updateDto) {
        return this.hashtagsService.updateHashtag(id, updateDto);
    }
    async deleteHashtag(id) {
        return this.hashtagsService.deleteHashtag(id);
    }
};
exports.HashtagsController = HashtagsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], HashtagsController.prototype, "getHashtags", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], HashtagsController.prototype, "getHashtag", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateHashtagSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateHashtagDto !== "undefined" && shared_1.CreateHashtagDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], HashtagsController.prototype, "createHashtag", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateHashtagSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateHashtagDto !== "undefined" && shared_1.UpdateHashtagDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], HashtagsController.prototype, "updateHashtag", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], HashtagsController.prototype, "deleteHashtag", null);
exports.HashtagsController = HashtagsController = __decorate([
    (0, common_1.Controller)('cramschool/hashtags'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof hashtags_service_1.HashtagsService !== "undefined" && hashtags_service_1.HashtagsService) === "function" ? _a : Object])
], HashtagsController);


/***/ }),

/***/ "./src/cramschool/controllers/leaves.controller.ts":
/*!*********************************************************!*\
  !*** ./src/cramschool/controllers/leaves.controller.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LeavesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const leaves_service_1 = __webpack_require__(/*! ../services/leaves.service */ "./src/cramschool/services/leaves.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let LeavesController = class LeavesController {
    constructor(leavesService) {
        this.leavesService = leavesService;
    }
    async getLeaves(includeDeleted = 'false', page = 1, pageSize = 10) {
        return this.leavesService.getLeaves(includeDeleted === 'true', page, pageSize);
    }
    async getLeave(id) {
        return this.leavesService.getLeave(id);
    }
    async createLeave(createDto) {
        return this.leavesService.createLeave(createDto);
    }
    async updateLeave(id, updateDto) {
        return this.leavesService.updateLeave(id, updateDto);
    }
    async deleteLeave(id) {
        return this.leavesService.deleteLeave(id);
    }
    async restoreLeave(id) {
        return this.leavesService.restoreLeave(id);
    }
};
exports.LeavesController = LeavesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('include_deleted')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaves", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], LeavesController.prototype, "getLeave", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateLeaveSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateLeaveDto !== "undefined" && shared_1.CreateLeaveDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], LeavesController.prototype, "createLeave", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateLeaveSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateLeaveDto !== "undefined" && shared_1.UpdateLeaveDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], LeavesController.prototype, "updateLeave", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], LeavesController.prototype, "deleteLeave", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], LeavesController.prototype, "restoreLeave", null);
exports.LeavesController = LeavesController = __decorate([
    (0, common_1.Controller)('cramschool/leaves'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof leaves_service_1.LeavesService !== "undefined" && leaves_service_1.LeavesService) === "function" ? _a : Object])
], LeavesController);


/***/ }),

/***/ "./src/cramschool/controllers/media.controller.ts":
/*!********************************************************!*\
  !*** ./src/cramschool/controllers/media.controller.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs/promises */ "fs/promises");
let MediaController = class MediaController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('沒有提供圖片文件');
        }
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const fileExt = path.extname(file.originalname).slice(1).toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            throw new common_1.BadRequestException(`不支援的文件類型。允許的類型：${allowedExtensions.join(', ')}`);
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('圖片文件大小不能超過 5MB');
        }
        const now = new Date();
        const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
        const uniqueFilename = `${(0, uuid_1.v4)().replace(/-/g, '')}.${fileExt}`;
        const relativePath = `question_images/${dateFolder}/${uniqueFilename}`;
        const mediaRoot = process.env.MEDIA_ROOT || './media';
        const fullPath = path.join(mediaRoot, relativePath);
        const dir = path.dirname(fullPath);
        try {
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(fullPath, file.buffer);
            const mediaUrl = process.env.MEDIA_URL || '/media/';
            const imageUrl = mediaUrl.startsWith('http')
                ? `${mediaUrl}${relativePath}`
                : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;
            return {
                image_path: relativePath,
                image_url: imageUrl,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`保存文件失敗：${error.message}`);
        }
    }
    async generateResource(body) {
        const { mode = 'HANDOUT', title = '自動生成的資源', subject_id, level, chapter, difficulty, tag_ids = [], source, course_id, is_individualized = false, student_group_ids = [], template_id, } = body;
        const where = {};
        if (subject_id) {
            where.subjectId = subject_id;
        }
        if (level) {
            where.level = level;
        }
        if (chapter) {
            where.chapter = { contains: chapter, mode: 'insensitive' };
        }
        if (difficulty) {
            where.difficulty = parseInt(difficulty);
        }
        if (tag_ids && tag_ids.length > 0) {
            const questionsWithTags = await this.prisma.cramschoolQuestionTag.findMany({
                where: { tagId: { in: tag_ids } },
                select: { questionId: true },
                distinct: ['questionId'],
            });
            where.questionId = { in: questionsWithTags.map((q) => q.questionId) };
        }
        if (source) {
            where.source = source;
        }
        const limit = mode === 'ONLINE_QUIZ' ? 50 : 100;
        const questions = await this.prisma.cramschoolQuestionBank.findMany({
            where,
            take: limit,
            include: {
                subject: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
            orderBy: { questionId: 'asc' },
        });
        const questionData = questions.map((q) => ({
            question_id: q.questionId,
            subject: q.subject?.name || null,
            level: q.level,
            chapter: q.chapter,
            content: q.content,
            correct_answer: q.correctAnswer,
            difficulty: q.difficulty,
            question_type: q.questionType,
            options: q.options,
            tags: q.tags?.map((t) => t.tag.tagName) || [],
        }));
        const structure = [];
        let idCounter = 1;
        if (template_id) {
            structure.push({
                id: idCounter,
                type: 'template',
                template_id: template_id,
            });
            idCounter++;
        }
        for (const question of questionData) {
            structure.push({
                id: idCounter,
                type: 'question',
                question_id: question.question_id,
            });
            idCounter++;
        }
        const responseData = {
            title,
            mode,
            course_id: course_id || null,
            questions: questionData,
            structure,
            total_count: questionData.length,
        };
        if (mode === 'ONLINE_QUIZ') {
            responseData.is_individualized = is_individualized;
            responseData.student_group_ids = student_group_ids;
        }
        return responseData;
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('generate-resource'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "generateResource", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('cramschool'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], MediaController);


/***/ }),

/***/ "./src/cramschool/controllers/order-items.controller.ts":
/*!**************************************************************!*\
  !*** ./src/cramschool/controllers/order-items.controller.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrderItemsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const order_items_service_1 = __webpack_require__(/*! ../services/order-items.service */ "./src/cramschool/services/order-items.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let OrderItemsController = class OrderItemsController {
    constructor(orderItemsService) {
        this.orderItemsService = orderItemsService;
    }
    async getOrderItems(orderId, page = 1, pageSize = 10) {
        return this.orderItemsService.getOrderItems(orderId, page, pageSize);
    }
    async getOrderItem(id) {
        return this.orderItemsService.getOrderItem(id);
    }
    async createOrderItem(createDto) {
        return this.orderItemsService.createOrderItem(createDto);
    }
    async updateOrderItem(id, updateDto) {
        return this.orderItemsService.updateOrderItem(id, updateDto);
    }
    async deleteOrderItem(id) {
        return this.orderItemsService.deleteOrderItem(id);
    }
};
exports.OrderItemsController = OrderItemsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('order', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], OrderItemsController.prototype, "getOrderItems", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], OrderItemsController.prototype, "getOrderItem", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateOrderItemSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateOrderItemDto !== "undefined" && shared_1.CreateOrderItemDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], OrderItemsController.prototype, "createOrderItem", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateOrderItemSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateOrderItemDto !== "undefined" && shared_1.UpdateOrderItemDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], OrderItemsController.prototype, "updateOrderItem", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], OrderItemsController.prototype, "deleteOrderItem", null);
exports.OrderItemsController = OrderItemsController = __decorate([
    (0, common_1.Controller)('cramschool/order-items'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof order_items_service_1.OrderItemsService !== "undefined" && order_items_service_1.OrderItemsService) === "function" ? _a : Object])
], OrderItemsController);


/***/ }),

/***/ "./src/cramschool/controllers/orders.controller.ts":
/*!*********************************************************!*\
  !*** ./src/cramschool/controllers/orders.controller.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrdersController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const orders_service_1 = __webpack_require__(/*! ../services/orders.service */ "./src/cramschool/services/orders.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let OrdersController = class OrdersController {
    constructor(ordersService, prisma) {
        this.ordersService = ordersService;
        this.prisma = prisma;
    }
    async getOrders(req, includeDeleted = 'false', groupOrderId, studentId, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        if (userRecord?.role === 'ADMIN') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        if (userRecord?.role === 'STUDENT') {
            const student = await this.prisma.cramschoolStudent.findFirst({
                where: { userId: user.id },
            });
            if (student) {
                studentId = student.studentId;
            }
            else {
                return { count: 0, results: [], page: 1, page_size: pageSize };
            }
        }
        return this.ordersService.getOrders(includeDeleted === 'true', groupOrderId, studentId, page, pageSize);
    }
    async getOrder(id) {
        return this.ordersService.getOrder(id);
    }
    async createOrder(createDto) {
        return this.ordersService.createOrder(createDto);
    }
    async updateOrder(id, updateDto) {
        return this.ordersService.updateOrder(id, updateDto);
    }
    async deleteOrder(id) {
        return this.ordersService.deleteOrder(id);
    }
    async restoreOrder(id) {
        return this.ordersService.restoreOrder(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('include_deleted')),
    __param(2, (0, common_1.Query)('group_order', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('student', new common_1.ParseIntPipe({ optional: true }))),
    __param(4, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, String, Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], OrdersController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateOrderSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.CreateOrderDto !== "undefined" && shared_1.CreateOrderDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateOrderSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.UpdateOrderDto !== "undefined" && shared_1.UpdateOrderDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], OrdersController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], OrdersController.prototype, "deleteOrder", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], OrdersController.prototype, "restoreOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('cramschool/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof orders_service_1.OrdersService !== "undefined" && orders_service_1.OrdersService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], OrdersController);


/***/ }),

/***/ "./src/cramschool/controllers/question-tags.controller.ts":
/*!****************************************************************!*\
  !*** ./src/cramschool/controllers/question-tags.controller.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionTagsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const question_tags_service_1 = __webpack_require__(/*! ../services/question-tags.service */ "./src/cramschool/services/question-tags.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let QuestionTagsController = class QuestionTagsController {
    constructor(questionTagsService) {
        this.questionTagsService = questionTagsService;
    }
    async getQuestionTags(page = 1, pageSize = 10) {
        return this.questionTagsService.getQuestionTags(page, pageSize);
    }
    async getQuestionTag(id) {
        return this.questionTagsService.getQuestionTag(id);
    }
    async createQuestionTag(createDto) {
        return this.questionTagsService.createQuestionTag(createDto);
    }
    async updateQuestionTag(id, updateDto) {
        return this.questionTagsService.updateQuestionTag(id, updateDto);
    }
    async deleteQuestionTag(id) {
        return this.questionTagsService.deleteQuestionTag(id);
    }
};
exports.QuestionTagsController = QuestionTagsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], QuestionTagsController.prototype, "getQuestionTags", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], QuestionTagsController.prototype, "getQuestionTag", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateQuestionTagSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateQuestionTagDto !== "undefined" && shared_1.CreateQuestionTagDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], QuestionTagsController.prototype, "createQuestionTag", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateQuestionTagSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateQuestionTagDto !== "undefined" && shared_1.UpdateQuestionTagDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], QuestionTagsController.prototype, "updateQuestionTag", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], QuestionTagsController.prototype, "deleteQuestionTag", null);
exports.QuestionTagsController = QuestionTagsController = __decorate([
    (0, common_1.Controller)('cramschool/question-tags'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof question_tags_service_1.QuestionTagsService !== "undefined" && question_tags_service_1.QuestionTagsService) === "function" ? _a : Object])
], QuestionTagsController);


/***/ }),

/***/ "./src/cramschool/controllers/questions.controller.ts":
/*!************************************************************!*\
  !*** ./src/cramschool/controllers/questions.controller.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionsController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const questions_service_1 = __webpack_require__(/*! ../services/questions/questions.service */ "./src/cramschool/services/questions/questions.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let QuestionsController = class QuestionsController {
    constructor(questionsService, prisma) {
        this.questionsService = questionsService;
        this.prisma = prisma;
    }
    async getQuestions(query, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.questionsService.getQuestions(query, user.id, userRecord?.role || 'STUDENT');
    }
    async getQuestion(id) {
        return this.questionsService.getQuestion(id);
    }
    async createQuestion(createDto, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.questionsService.createQuestion(createDto, user.id, userRecord?.role || 'STUDENT');
    }
    async updateQuestion(id, updateDto, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.questionsService.updateQuestion(id, updateDto, user.id, userRecord?.role || 'STUDENT');
    }
    async deleteQuestion(id, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.questionsService.deleteQuestion(id, userRecord?.role || 'STUDENT');
    }
    async searchChapters(query, subjectId, level) {
        return this.questionsService.searchChapters(query, subjectId, level);
    }
    async getSourceOptions() {
        return this.questionsService.getSourceOptions();
    }
    async exportToLatex(id) {
        return this.questionsService.exportToLatex(id);
    }
    async exportToMarkdown(id) {
        return this.questionsService.exportToMarkdown(id);
    }
    async previewFromWord(req, file, body) {
        if (!body.subject_id || !body.level || !body.chapter) {
            throw new Error('請提供 subject_id, level, chapter');
        }
        return this.questionsService.previewFromWord(file, body.subject_id, body.level, body.chapter);
    }
    async importFromWord(req, file, body) {
        const user = req.user;
        if (!body.subject_id || !body.level || !body.chapter) {
            throw new Error('請提供 subject_id, level, chapter');
        }
        return this.questionsService.importFromWord(file, body.subject_id, body.level, body.chapter, user.id);
    }
    async previewFromMarkdown(req, files, body) {
        if (!body.subject_id || !body.level || !body.chapter) {
            throw new Error('請提供 subject_id, level, chapter');
        }
        const markdownFile = files.find((f) => f.fieldname === 'markdown_file' && (f.originalname.endsWith('.md') || f.originalname.endsWith('.markdown')));
        const imageFiles = files.filter((f) => f.fieldname === 'images' || f.fieldname.startsWith('images'));
        if (!markdownFile) {
            throw new Error('請選擇 Markdown 檔案');
        }
        return this.questionsService.previewFromMarkdown(markdownFile, imageFiles || [], body.subject_id, body.level, body.chapter);
    }
    async importFromMarkdown(req, files, body) {
        const user = req.user;
        if (!body.subject_id || !body.level || !body.chapter) {
            throw new Error('請提供 subject_id, level, chapter');
        }
        const markdownFile = files.find((f) => f.fieldname === 'markdown_file' && (f.originalname.endsWith('.md') || f.originalname.endsWith('.markdown')));
        const imageFiles = files.filter((f) => f.fieldname === 'images' || f.fieldname.startsWith('images'));
        if (!markdownFile) {
            throw new Error('請選擇 Markdown 檔案');
        }
        return this.questionsService.importFromMarkdown(markdownFile, imageFiles || [], body.subject_id, body.level, body.chapter, user.id);
    }
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new nestjs_zod_1.ZodValidationPipe(shared_1.QuestionQuerySchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.QuestionQuery !== "undefined" && shared_1.QuestionQuery) === "function" ? _c : Object, typeof (_d = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], QuestionsController.prototype, "getQuestion", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateQuestionSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof shared_1.CreateQuestionDto !== "undefined" && shared_1.CreateQuestionDto) === "function" ? _f : Object, typeof (_g = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], QuestionsController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateQuestionSchema))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_j = typeof shared_1.UpdateQuestionDto !== "undefined" && shared_1.UpdateQuestionDto) === "function" ? _j : Object, typeof (_k = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], QuestionsController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_m = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _m : Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], QuestionsController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Get)('search-chapters'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('subject', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], QuestionsController.prototype, "searchChapters", null);
__decorate([
    (0, common_1.Get)('source-options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], QuestionsController.prototype, "getSourceOptions", null);
__decorate([
    (0, common_1.Get)(':id/export-to-latex'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], QuestionsController.prototype, "exportToLatex", null);
__decorate([
    (0, common_1.Get)(':id/export-to-markdown'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], QuestionsController.prototype, "exportToMarkdown", null);
__decorate([
    (0, common_1.Post)('preview-from-word'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_t = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _t : Object, typeof (_v = typeof Express !== "undefined" && (_u = Express.Multer) !== void 0 && _u.File) === "function" ? _v : Object, Object]),
    __metadata("design:returntype", typeof (_w = typeof Promise !== "undefined" && Promise) === "function" ? _w : Object)
], QuestionsController.prototype, "previewFromWord", null);
__decorate([
    (0, common_1.Post)('import-from-word'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_x = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _x : Object, typeof (_z = typeof Express !== "undefined" && (_y = Express.Multer) !== void 0 && _y.File) === "function" ? _z : Object, Object]),
    __metadata("design:returntype", typeof (_0 = typeof Promise !== "undefined" && Promise) === "function" ? _0 : Object)
], QuestionsController.prototype, "importFromWord", null);
__decorate([
    (0, common_1.Post)('preview-from-markdown'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_1 = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _1 : Object, Array, Object]),
    __metadata("design:returntype", typeof (_2 = typeof Promise !== "undefined" && Promise) === "function" ? _2 : Object)
], QuestionsController.prototype, "previewFromMarkdown", null);
__decorate([
    (0, common_1.Post)('import-from-markdown'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_3 = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _3 : Object, Array, Object]),
    __metadata("design:returntype", typeof (_4 = typeof Promise !== "undefined" && Promise) === "function" ? _4 : Object)
], QuestionsController.prototype, "importFromMarkdown", null);
exports.QuestionsController = QuestionsController = __decorate([
    (0, common_1.Controller)('cramschool/questions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof questions_service_1.QuestionsService !== "undefined" && questions_service_1.QuestionsService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], QuestionsController);


/***/ }),

/***/ "./src/cramschool/controllers/resources.controller.ts":
/*!************************************************************!*\
  !*** ./src/cramschool/controllers/resources.controller.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourcesController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const resources_service_1 = __webpack_require__(/*! ../services/resources.service */ "./src/cramschool/services/resources.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let ResourcesController = class ResourcesController {
    constructor(resourcesService, prisma) {
        this.resourcesService = resourcesService;
        this.prisma = prisma;
    }
    async getResources(req, page = 1, pageSize = 10, courseId, mode) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.resourcesService.getResources(user.id, userRecord?.role || 'STUDENT', page, pageSize, courseId, mode);
    }
    async getResource(id) {
        return this.resourcesService.getResource(id);
    }
    async createResource(createDto, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.resourcesService.createResource(createDto, user.id, userRecord?.role || 'STUDENT');
    }
    async updateResource(id, updateDto, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.resourcesService.updateResource(id, updateDto, user.id, userRecord?.role || 'STUDENT');
    }
    async deleteResource(id, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.resourcesService.deleteResource(id, userRecord?.role || 'STUDENT');
    }
    async bindToCourse(req, id, body) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (!body.course_id) {
            throw new Error('需要提供 course_id');
        }
        return this.resourcesService.bindToCourse(id, body.course_id, body.action || 'add', user.id, userRole);
    }
    async exportResource(id, body) {
        return this.resourcesService.exportResource(id, body.format_type || 'question_only');
    }
    async gradeResource(id, body) {
        return this.resourcesService.gradeResource(id, body.submission || {});
    }
};
exports.ResourcesController = ResourcesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('course', new common_1.ParseIntPipe({ optional: true }))),
    __param(4, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "getResources", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ResourcesController.prototype, "getResource", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateLearningResourceSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.CreateLearningResourceDto !== "undefined" && shared_1.CreateLearningResourceDto) === "function" ? _e : Object, typeof (_f = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], ResourcesController.prototype, "createResource", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateLearningResourceSchema))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof shared_1.UpdateLearningResourceDto !== "undefined" && shared_1.UpdateLearningResourceDto) === "function" ? _h : Object, typeof (_j = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], ResourcesController.prototype, "updateResource", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_l = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _l : Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], ResourcesController.prototype, "deleteResource", null);
__decorate([
    (0, common_1.Post)(':id/bind-to-course'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _o : Object, Number, Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], ResourcesController.prototype, "bindToCourse", null);
__decorate([
    (0, common_1.Post)(':id/export'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], ResourcesController.prototype, "exportResource", null);
__decorate([
    (0, common_1.Post)(':id/grade'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], ResourcesController.prototype, "gradeResource", null);
exports.ResourcesController = ResourcesController = __decorate([
    (0, common_1.Controller)('cramschool/resources'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof resources_service_1.ResourcesService !== "undefined" && resources_service_1.ResourcesService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], ResourcesController);


/***/ }),

/***/ "./src/cramschool/controllers/restaurants.controller.ts":
/*!**************************************************************!*\
  !*** ./src/cramschool/controllers/restaurants.controller.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RestaurantsController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const restaurants_service_1 = __webpack_require__(/*! ../services/restaurants.service */ "./src/cramschool/services/restaurants.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let RestaurantsController = class RestaurantsController {
    constructor(restaurantsService, prisma) {
        this.restaurantsService = restaurantsService;
        this.prisma = prisma;
    }
    async getRestaurants(req, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        if (userRecord?.role === 'ADMIN') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        return this.restaurantsService.getRestaurants(page, pageSize);
    }
    async getRestaurant(id) {
        return this.restaurantsService.getRestaurant(id);
    }
    async createRestaurant(createDto) {
        return this.restaurantsService.createRestaurant(createDto);
    }
    async updateRestaurant(id, updateDto) {
        return this.restaurantsService.updateRestaurant(id, updateDto);
    }
    async deleteRestaurant(id) {
        return this.restaurantsService.deleteRestaurant(id);
    }
};
exports.RestaurantsController = RestaurantsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, Number, Number]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getRestaurants", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], RestaurantsController.prototype, "getRestaurant", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateRestaurantSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.CreateRestaurantDto !== "undefined" && shared_1.CreateRestaurantDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], RestaurantsController.prototype, "createRestaurant", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateRestaurantSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.UpdateRestaurantDto !== "undefined" && shared_1.UpdateRestaurantDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], RestaurantsController.prototype, "updateRestaurant", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], RestaurantsController.prototype, "deleteRestaurant", null);
exports.RestaurantsController = RestaurantsController = __decorate([
    (0, common_1.Controller)('cramschool/restaurants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof restaurants_service_1.RestaurantsService !== "undefined" && restaurants_service_1.RestaurantsService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], RestaurantsController);


/***/ }),

/***/ "./src/cramschool/controllers/sessions.controller.ts":
/*!***********************************************************!*\
  !*** ./src/cramschool/controllers/sessions.controller.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const sessions_service_1 = __webpack_require__(/*! ../services/sessions.service */ "./src/cramschool/services/sessions.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let SessionsController = class SessionsController {
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    async getSessions(page = 1, pageSize = 10) {
        return this.sessionsService.getSessions(page, pageSize);
    }
    async getSession(id) {
        return this.sessionsService.getSession(id);
    }
    async createSession(createDto) {
        return this.sessionsService.createSession(createDto);
    }
    async updateSession(id, updateDto) {
        return this.sessionsService.updateSession(id, updateDto);
    }
    async deleteSession(id) {
        return this.sessionsService.deleteSession(id);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], SessionsController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateSessionSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateSessionDto !== "undefined" && shared_1.CreateSessionDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], SessionsController.prototype, "createSession", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateSessionSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateSessionDto !== "undefined" && shared_1.UpdateSessionDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], SessionsController.prototype, "updateSession", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], SessionsController.prototype, "deleteSession", null);
exports.SessionsController = SessionsController = __decorate([
    (0, common_1.Controller)('cramschool/sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof sessions_service_1.SessionsService !== "undefined" && sessions_service_1.SessionsService) === "function" ? _a : Object])
], SessionsController);


/***/ }),

/***/ "./src/cramschool/controllers/student-answers.controller.ts":
/*!******************************************************************!*\
  !*** ./src/cramschool/controllers/student-answers.controller.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentAnswersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const student_answers_service_1 = __webpack_require__(/*! ../services/student-answers.service */ "./src/cramschool/services/student-answers.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let StudentAnswersController = class StudentAnswersController {
    constructor(studentAnswersService) {
        this.studentAnswersService = studentAnswersService;
    }
    async getStudentAnswers(includeDeleted = 'false', page = 1, pageSize = 10) {
        return this.studentAnswersService.getStudentAnswers(includeDeleted === 'true', page, pageSize);
    }
    async getStudentAnswer(id) {
        return this.studentAnswersService.getStudentAnswer(id);
    }
    async createStudentAnswer(createDto) {
        return this.studentAnswersService.createStudentAnswer(createDto);
    }
    async updateStudentAnswer(id, updateDto) {
        return this.studentAnswersService.updateStudentAnswer(id, updateDto);
    }
    async deleteStudentAnswer(id) {
        return this.studentAnswersService.deleteStudentAnswer(id);
    }
    async restoreStudentAnswer(id) {
        return this.studentAnswersService.restoreStudentAnswer(id);
    }
};
exports.StudentAnswersController = StudentAnswersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('include_deleted')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], StudentAnswersController.prototype, "getStudentAnswers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], StudentAnswersController.prototype, "getStudentAnswer", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentAnswerSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateStudentAnswerDto !== "undefined" && shared_1.CreateStudentAnswerDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], StudentAnswersController.prototype, "createStudentAnswer", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateStudentAnswerSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateStudentAnswerDto !== "undefined" && shared_1.UpdateStudentAnswerDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], StudentAnswersController.prototype, "updateStudentAnswer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], StudentAnswersController.prototype, "deleteStudentAnswer", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], StudentAnswersController.prototype, "restoreStudentAnswer", null);
exports.StudentAnswersController = StudentAnswersController = __decorate([
    (0, common_1.Controller)('cramschool/student-answers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof student_answers_service_1.StudentAnswersService !== "undefined" && student_answers_service_1.StudentAnswersService) === "function" ? _a : Object])
], StudentAnswersController);


/***/ }),

/***/ "./src/cramschool/controllers/student-groups.controller.ts":
/*!*****************************************************************!*\
  !*** ./src/cramschool/controllers/student-groups.controller.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentGroupsController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const student_groups_service_1 = __webpack_require__(/*! ../services/student-groups.service */ "./src/cramschool/services/student-groups.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let StudentGroupsController = class StudentGroupsController {
    constructor(studentGroupsService) {
        this.studentGroupsService = studentGroupsService;
    }
    async getStudentGroups(query) {
        return this.studentGroupsService.getStudentGroups(query);
    }
    async getStudentGroup(id) {
        return this.studentGroupsService.getStudentGroup(id);
    }
    async createStudentGroup(createDto, req) {
        const user = req.user;
        return this.studentGroupsService.createStudentGroup(createDto, user.id);
    }
    async updateStudentGroup(id, updateDto) {
        return this.studentGroupsService.updateStudentGroup(id, updateDto);
    }
    async deleteStudentGroup(id) {
        return this.studentGroupsService.deleteStudentGroup(id);
    }
    async addStudentsToGroup(id, dto) {
        return this.studentGroupsService.addStudentsToGroup(id, dto);
    }
    async removeStudentsFromGroup(id, dto) {
        return this.studentGroupsService.removeStudentsFromGroup(id, dto);
    }
};
exports.StudentGroupsController = StudentGroupsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new nestjs_zod_1.ZodValidationPipe(shared_1.StudentGroupQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof shared_1.StudentGroupQuery !== "undefined" && shared_1.StudentGroupQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], StudentGroupsController.prototype, "getStudentGroups", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], StudentGroupsController.prototype, "getStudentGroup", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentGroupSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof shared_1.CreateStudentGroupDto !== "undefined" && shared_1.CreateStudentGroupDto) === "function" ? _d : Object, typeof (_e = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], StudentGroupsController.prototype, "createStudentGroup", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateStudentGroupSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.UpdateStudentGroupDto !== "undefined" && shared_1.UpdateStudentGroupDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], StudentGroupsController.prototype, "updateStudentGroup", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], StudentGroupsController.prototype, "deleteStudentGroup", null);
__decorate([
    (0, common_1.Post)(':id/add-students'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.AddStudentsToGroupSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_k = typeof shared_1.AddStudentsToGroupDto !== "undefined" && shared_1.AddStudentsToGroupDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], StudentGroupsController.prototype, "addStudentsToGroup", null);
__decorate([
    (0, common_1.Post)(':id/remove-students'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.RemoveStudentsFromGroupSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_m = typeof shared_1.RemoveStudentsFromGroupDto !== "undefined" && shared_1.RemoveStudentsFromGroupDto) === "function" ? _m : Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], StudentGroupsController.prototype, "removeStudentsFromGroup", null);
exports.StudentGroupsController = StudentGroupsController = __decorate([
    (0, common_1.Controller)('cramschool/student-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof student_groups_service_1.StudentGroupsService !== "undefined" && student_groups_service_1.StudentGroupsService) === "function" ? _a : Object])
], StudentGroupsController);


/***/ }),

/***/ "./src/cramschool/controllers/student-mistake-note-images.controller.ts":
/*!******************************************************************************!*\
  !*** ./src/cramschool/controllers/student-mistake-note-images.controller.ts ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentMistakeNoteImagesController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const student_mistake_note_images_service_1 = __webpack_require__(/*! ../services/student-mistake-note-images.service */ "./src/cramschool/services/student-mistake-note-images.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let StudentMistakeNoteImagesController = class StudentMistakeNoteImagesController {
    constructor(studentMistakeNoteImagesService, prisma) {
        this.studentMistakeNoteImagesService = studentMistakeNoteImagesService;
        this.prisma = prisma;
    }
    async getStudentMistakeNoteImages(req, noteId, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNoteImagesService.getStudentMistakeNoteImages(user.id, userRole, noteId, page, pageSize);
    }
    async getStudentMistakeNoteImage(req, id) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNoteImagesService.getStudentMistakeNoteImage(id, user.id, userRole);
    }
    async createStudentMistakeNoteImage(req, createDto) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNoteImagesService.createStudentMistakeNoteImage(createDto, user.id, userRole);
    }
    async updateStudentMistakeNoteImage(req, id, updateDto) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNoteImagesService.updateStudentMistakeNoteImage(id, updateDto, user.id, userRole);
    }
    async deleteStudentMistakeNoteImage(req, id) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNoteImagesService.deleteStudentMistakeNoteImage(id, user.id, userRole);
    }
};
exports.StudentMistakeNoteImagesController = StudentMistakeNoteImagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('note', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], StudentMistakeNoteImagesController.prototype, "getStudentMistakeNoteImages", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _d : Object, Number]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], StudentMistakeNoteImagesController.prototype, "getStudentMistakeNoteImage", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentMistakeNoteImageSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _f : Object, typeof (_g = typeof shared_1.CreateStudentMistakeNoteImageDto !== "undefined" && shared_1.CreateStudentMistakeNoteImageDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], StudentMistakeNoteImagesController.prototype, "createStudentMistakeNoteImage", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateStudentMistakeNoteImageSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _j : Object, Number, typeof (_k = typeof shared_1.UpdateStudentMistakeNoteImageDto !== "undefined" && shared_1.UpdateStudentMistakeNoteImageDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], StudentMistakeNoteImagesController.prototype, "updateStudentMistakeNoteImage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _m : Object, Number]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], StudentMistakeNoteImagesController.prototype, "deleteStudentMistakeNoteImage", null);
exports.StudentMistakeNoteImagesController = StudentMistakeNoteImagesController = __decorate([
    (0, common_1.Controller)('cramschool/student-mistake-note-images'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof student_mistake_note_images_service_1.StudentMistakeNoteImagesService !== "undefined" && student_mistake_note_images_service_1.StudentMistakeNoteImagesService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], StudentMistakeNoteImagesController);


/***/ }),

/***/ "./src/cramschool/controllers/student-mistake-notes.controller.ts":
/*!************************************************************************!*\
  !*** ./src/cramschool/controllers/student-mistake-notes.controller.ts ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentMistakeNotesController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const student_mistake_notes_service_1 = __webpack_require__(/*! ../services/student-mistake-notes.service */ "./src/cramschool/services/student-mistake-notes.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let StudentMistakeNotesController = class StudentMistakeNotesController {
    constructor(studentMistakeNotesService, prisma) {
        this.studentMistakeNotesService = studentMistakeNotesService;
        this.prisma = prisma;
    }
    async getStudentMistakeNotes(req, includeDeleted = 'false', studentId, searchQuery, page = 1, pageSize = 10) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNotesService.getStudentMistakeNotes(user.id, userRole, includeDeleted === 'true', studentId, searchQuery, page, pageSize);
    }
    async getStudentMistakeNote(req, id) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNotesService.getStudentMistakeNote(id, user.id, userRole);
    }
    async createStudentMistakeNote(req, createDto) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNotesService.createStudentMistakeNote(createDto, user.id, userRole);
    }
    async updateStudentMistakeNote(req, id, updateDto) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNotesService.updateStudentMistakeNote(id, updateDto, user.id, userRole);
    }
    async deleteStudentMistakeNote(req, id) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        return this.studentMistakeNotesService.deleteStudentMistakeNote(id, user.id, userRole);
    }
    async restoreStudentMistakeNote(id) {
        return this.studentMistakeNotesService.restoreStudentMistakeNote(id);
    }
    async importToQuestionBank(req, id, body) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (userRole === 'ACCOUNTANT') {
            throw new Error('會計不可匯入題庫');
        }
        if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
            throw new Error('無權限');
        }
        return this.studentMistakeNotesService.importToQuestionBank(id, user.id, body);
    }
    async uploadImages(req, id, files) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (userRole !== 'STUDENT') {
            throw new Error('只有學生可以上傳錯題筆記圖片');
        }
        if (!files || files.length === 0) {
            throw new Error('沒有提供圖片');
        }
        return this.studentMistakeNotesService.uploadImages(id, user.id, files);
    }
    async reorderImages(req, id, body) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        const userRole = userRecord?.role || '';
        if (userRole !== 'STUDENT') {
            throw new Error('只有學生可以操作');
        }
        if (!body.image_ids || !Array.isArray(body.image_ids) || body.image_ids.length === 0) {
            throw new Error('請提供 image_ids');
        }
        return this.studentMistakeNotesService.reorderImages(id, user.id, body.image_ids);
    }
};
exports.StudentMistakeNotesController = StudentMistakeNotesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('include_deleted')),
    __param(2, (0, common_1.Query)('student_id', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('q')),
    __param(4, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object, String, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], StudentMistakeNotesController.prototype, "getStudentMistakeNotes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _d : Object, Number]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], StudentMistakeNotesController.prototype, "getStudentMistakeNote", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentMistakeNoteSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _f : Object, typeof (_g = typeof shared_1.CreateStudentMistakeNoteDto !== "undefined" && shared_1.CreateStudentMistakeNoteDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], StudentMistakeNotesController.prototype, "createStudentMistakeNote", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateStudentMistakeNoteSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _j : Object, Number, typeof (_k = typeof shared_1.UpdateStudentMistakeNoteDto !== "undefined" && shared_1.UpdateStudentMistakeNoteDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], StudentMistakeNotesController.prototype, "updateStudentMistakeNote", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _m : Object, Number]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], StudentMistakeNotesController.prototype, "deleteStudentMistakeNote", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], StudentMistakeNotesController.prototype, "restoreStudentMistakeNote", null);
__decorate([
    (0, common_1.Post)(':id/import-to-question-bank'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_q = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _q : Object, Number, Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], StudentMistakeNotesController.prototype, "importToQuestionBank", null);
__decorate([
    (0, common_1.Post)(':id/upload-images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_s = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _s : Object, Number, Array]),
    __metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], StudentMistakeNotesController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Post)(':id/reorder-images'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_u = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _u : Object, Number, Object]),
    __metadata("design:returntype", typeof (_v = typeof Promise !== "undefined" && Promise) === "function" ? _v : Object)
], StudentMistakeNotesController.prototype, "reorderImages", null);
exports.StudentMistakeNotesController = StudentMistakeNotesController = __decorate([
    (0, common_1.Controller)('cramschool/student-mistake-notes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof student_mistake_notes_service_1.StudentMistakeNotesService !== "undefined" && student_mistake_notes_service_1.StudentMistakeNotesService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], StudentMistakeNotesController);


/***/ }),

/***/ "./src/cramschool/controllers/students.controller.ts":
/*!***********************************************************!*\
  !*** ./src/cramschool/controllers/students.controller.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentsController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const students_service_1 = __webpack_require__(/*! ../services/students/students.service */ "./src/cramschool/services/students/students.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let StudentsController = class StudentsController {
    constructor(studentsService, prisma) {
        this.studentsService = studentsService;
        this.prisma = prisma;
    }
    async getStudents(query, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.studentsService.getStudents(query, user.id, userRecord?.role || 'STUDENT');
    }
    async getStudent(id) {
        return this.studentsService.getStudent(id);
    }
    async createStudent(createDto, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.studentsService.createStudent(createDto, user.id, userRecord?.role || 'STUDENT');
    }
    async updateStudent(id, updateDto) {
        return this.studentsService.updateStudent(id, updateDto);
    }
    async deleteStudent(id) {
        return this.studentsService.deleteStudent(id);
    }
    async restoreStudent(id) {
        return this.studentsService.restoreStudent(id);
    }
    async getTuitionStatus(id) {
        return this.studentsService.getTuitionStatus(id);
    }
    async generateTuition(id, data) {
        return this.studentsService.generateTuition(id, data);
    }
    async batchGenerateTuitions(data) {
        const studentIds = data.student_ids || [];
        const weeks = data.weeks || 4;
        return this.studentsService.batchGenerateTuitions(studentIds, weeks);
    }
    async resetPassword(id, data) {
        return this.studentsService.resetPassword(id, data.password);
    }
    async toggleAccountStatus(id) {
        return this.studentsService.toggleAccountStatus(id);
    }
    async getAttendanceAndLeaves(id) {
        return this.studentsService.getAttendanceAndLeaves(id);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new nestjs_zod_1.ZodValidationPipe(shared_1.StudentQuerySchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.StudentQuery !== "undefined" && shared_1.StudentQuery) === "function" ? _c : Object, typeof (_d = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], StudentsController.prototype, "getStudent", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof shared_1.CreateStudentDto !== "undefined" && shared_1.CreateStudentDto) === "function" ? _f : Object, typeof (_g = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], StudentsController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateStudentSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_j = typeof shared_1.UpdateStudentDto !== "undefined" && shared_1.UpdateStudentDto) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], StudentsController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], StudentsController.prototype, "deleteStudent", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], StudentsController.prototype, "restoreStudent", null);
__decorate([
    (0, common_1.Get)(':id/tuition_status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], StudentsController.prototype, "getTuitionStatus", null);
__decorate([
    (0, common_1.Post)(':id/generate_tuition'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], StudentsController.prototype, "generateTuition", null);
__decorate([
    (0, common_1.Post)('batch-generate-tuitions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], StudentsController.prototype, "batchGenerateTuitions", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], StudentsController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)(':id/toggle-account-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], StudentsController.prototype, "toggleAccountStatus", null);
__decorate([
    (0, common_1.Get)(':id/attendance_and_leaves'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], StudentsController.prototype, "getAttendanceAndLeaves", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('cramschool/students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof students_service_1.StudentsService !== "undefined" && students_service_1.StudentsService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], StudentsController);


/***/ }),

/***/ "./src/cramschool/controllers/subjects.controller.ts":
/*!***********************************************************!*\
  !*** ./src/cramschool/controllers/subjects.controller.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubjectsController = void 0;
const request_types_1 = __webpack_require__(/*! @/types/request.types */ "./src/types/request.types.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const subjects_service_1 = __webpack_require__(/*! ../services/subjects.service */ "./src/cramschool/services/subjects.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let SubjectsController = class SubjectsController {
    constructor(subjectsService, prisma) {
        this.subjectsService = subjectsService;
        this.prisma = prisma;
    }
    async getSubjects(page = 1, pageSize = 10, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.subjectsService.getSubjects(page, pageSize, userRecord?.role || 'STUDENT');
    }
    async getSubject(id, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.subjectsService.getSubject(id, userRecord?.role || 'STUDENT');
    }
    async createSubject(createDto, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.subjectsService.createSubject(createDto, userRecord?.role || 'STUDENT');
    }
    async updateSubject(id, updateDto, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.subjectsService.updateSubject(id, updateDto, userRecord?.role || 'STUDENT');
    }
    async deleteSubject(id, req) {
        const user = req.user;
        const userRecord = await this.prisma.accountCustomUser.findUnique({
            where: { id: user.id },
        });
        return this.subjectsService.deleteSubject(id, userRecord?.role || 'STUDENT');
    }
};
exports.SubjectsController = SubjectsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, typeof (_c = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], SubjectsController.prototype, "getSubject", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateSubjectSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof shared_1.CreateSubjectDto !== "undefined" && shared_1.CreateSubjectDto) === "function" ? _f : Object, typeof (_g = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], SubjectsController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateSubjectSchema))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_j = typeof shared_1.UpdateSubjectDto !== "undefined" && shared_1.UpdateSubjectDto) === "function" ? _j : Object, typeof (_k = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], SubjectsController.prototype, "updateSubject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_m = typeof request_types_1.AuthRequest !== "undefined" && request_types_1.AuthRequest) === "function" ? _m : Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], SubjectsController.prototype, "deleteSubject", null);
exports.SubjectsController = SubjectsController = __decorate([
    (0, common_1.Controller)('cramschool/subjects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof subjects_service_1.SubjectsService !== "undefined" && subjects_service_1.SubjectsService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], SubjectsController);


/***/ }),

/***/ "./src/cramschool/controllers/teachers.controller.ts":
/*!***********************************************************!*\
  !*** ./src/cramschool/controllers/teachers.controller.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TeachersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const teachers_service_1 = __webpack_require__(/*! ../services/teachers.service */ "./src/cramschool/services/teachers.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let TeachersController = class TeachersController {
    constructor(teachersService) {
        this.teachersService = teachersService;
    }
    async getTeachers(page = 1, pageSize = 10) {
        return this.teachersService.getTeachers(page, pageSize);
    }
    async getTeacher(id) {
        return this.teachersService.getTeacher(id);
    }
    async createTeacher(createDto) {
        return this.teachersService.createTeacher(createDto);
    }
    async updateTeacher(id, updateDto) {
        return this.teachersService.updateTeacher(id, updateDto);
    }
    async deleteTeacher(id) {
        return this.teachersService.deleteTeacher(id);
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeachers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], TeachersController.prototype, "getTeacher", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateTeacherSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateTeacherDto !== "undefined" && shared_1.CreateTeacherDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], TeachersController.prototype, "createTeacher", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateTeacherSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateTeacherDto !== "undefined" && shared_1.UpdateTeacherDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], TeachersController.prototype, "updateTeacher", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], TeachersController.prototype, "deleteTeacher", null);
exports.TeachersController = TeachersController = __decorate([
    (0, common_1.Controller)('cramschool/teachers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof teachers_service_1.TeachersService !== "undefined" && teachers_service_1.TeachersService) === "function" ? _a : Object])
], TeachersController);


/***/ }),

/***/ "./src/cramschool/cramschool.module.ts":
/*!*********************************************!*\
  !*** ./src/cramschool/cramschool.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CramschoolModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const students_controller_1 = __webpack_require__(/*! ./controllers/students.controller */ "./src/cramschool/controllers/students.controller.ts");
const teachers_controller_1 = __webpack_require__(/*! ./controllers/teachers.controller */ "./src/cramschool/controllers/teachers.controller.ts");
const courses_controller_1 = __webpack_require__(/*! ./controllers/courses.controller */ "./src/cramschool/controllers/courses.controller.ts");
const enrollments_controller_1 = __webpack_require__(/*! ./controllers/enrollments.controller */ "./src/cramschool/controllers/enrollments.controller.ts");
const enrollment_periods_controller_1 = __webpack_require__(/*! ./controllers/enrollment-periods.controller */ "./src/cramschool/controllers/enrollment-periods.controller.ts");
const leaves_controller_1 = __webpack_require__(/*! ./controllers/leaves.controller */ "./src/cramschool/controllers/leaves.controller.ts");
const questions_controller_1 = __webpack_require__(/*! ./controllers/questions.controller */ "./src/cramschool/controllers/questions.controller.ts");
const resources_controller_1 = __webpack_require__(/*! ./controllers/resources.controller */ "./src/cramschool/controllers/resources.controller.ts");
const student_groups_controller_1 = __webpack_require__(/*! ./controllers/student-groups.controller */ "./src/cramschool/controllers/student-groups.controller.ts");
const fees_controller_1 = __webpack_require__(/*! ./controllers/fees.controller */ "./src/cramschool/controllers/fees.controller.ts");
const students_service_1 = __webpack_require__(/*! ./services/students/students.service */ "./src/cramschool/services/students/students.service.ts");
const students_permission_service_1 = __webpack_require__(/*! ./services/students/students-permission.service */ "./src/cramschool/services/students/students-permission.service.ts");
const students_query_service_1 = __webpack_require__(/*! ./services/students/students-query.service */ "./src/cramschool/services/students/students-query.service.ts");
const students_fee_service_1 = __webpack_require__(/*! ./services/students/students-fee.service */ "./src/cramschool/services/students/students-fee.service.ts");
const students_stats_service_1 = __webpack_require__(/*! ./services/students/students-stats.service */ "./src/cramschool/services/students/students-stats.service.ts");
const teachers_service_1 = __webpack_require__(/*! ./services/teachers.service */ "./src/cramschool/services/teachers.service.ts");
const courses_service_1 = __webpack_require__(/*! ./services/courses.service */ "./src/cramschool/services/courses.service.ts");
const enrollments_service_1 = __webpack_require__(/*! ./services/enrollments.service */ "./src/cramschool/services/enrollments.service.ts");
const enrollment_periods_service_1 = __webpack_require__(/*! ./services/enrollment-periods.service */ "./src/cramschool/services/enrollment-periods.service.ts");
const leaves_service_1 = __webpack_require__(/*! ./services/leaves.service */ "./src/cramschool/services/leaves.service.ts");
const questions_service_1 = __webpack_require__(/*! ./services/questions/questions.service */ "./src/cramschool/services/questions/questions.service.ts");
const questions_permission_service_1 = __webpack_require__(/*! ./services/questions/questions-permission.service */ "./src/cramschool/services/questions/questions-permission.service.ts");
const questions_query_service_1 = __webpack_require__(/*! ./services/questions/questions-query.service */ "./src/cramschool/services/questions/questions-query.service.ts");
const questions_export_service_1 = __webpack_require__(/*! ./services/questions/questions-export.service */ "./src/cramschool/services/questions/questions-export.service.ts");
const questions_import_service_1 = __webpack_require__(/*! ./services/questions/questions-import.service */ "./src/cramschool/services/questions/questions-import.service.ts");
const resources_service_1 = __webpack_require__(/*! ./services/resources.service */ "./src/cramschool/services/resources.service.ts");
const student_groups_service_1 = __webpack_require__(/*! ./services/student-groups.service */ "./src/cramschool/services/student-groups.service.ts");
const fees_service_1 = __webpack_require__(/*! ./services/fees.service */ "./src/cramschool/services/fees.service.ts");
const media_controller_1 = __webpack_require__(/*! ./controllers/media.controller */ "./src/cramschool/controllers/media.controller.ts");
const attendances_controller_1 = __webpack_require__(/*! ./controllers/attendances.controller */ "./src/cramschool/controllers/attendances.controller.ts");
const sessions_controller_1 = __webpack_require__(/*! ./controllers/sessions.controller */ "./src/cramschool/controllers/sessions.controller.ts");
const attendances_service_1 = __webpack_require__(/*! ./services/attendances.service */ "./src/cramschool/services/attendances.service.ts");
const sessions_service_1 = __webpack_require__(/*! ./services/sessions.service */ "./src/cramschool/services/sessions.service.ts");
const subjects_controller_1 = __webpack_require__(/*! ./controllers/subjects.controller */ "./src/cramschool/controllers/subjects.controller.ts");
const subjects_service_1 = __webpack_require__(/*! ./services/subjects.service */ "./src/cramschool/services/subjects.service.ts");
const hashtags_controller_1 = __webpack_require__(/*! ./controllers/hashtags.controller */ "./src/cramschool/controllers/hashtags.controller.ts");
const hashtags_service_1 = __webpack_require__(/*! ./services/hashtags.service */ "./src/cramschool/services/hashtags.service.ts");
const question_tags_controller_1 = __webpack_require__(/*! ./controllers/question-tags.controller */ "./src/cramschool/controllers/question-tags.controller.ts");
const question_tags_service_1 = __webpack_require__(/*! ./services/question-tags.service */ "./src/cramschool/services/question-tags.service.ts");
const student_answers_controller_1 = __webpack_require__(/*! ./controllers/student-answers.controller */ "./src/cramschool/controllers/student-answers.controller.ts");
const student_answers_service_1 = __webpack_require__(/*! ./services/student-answers.service */ "./src/cramschool/services/student-answers.service.ts");
const restaurants_controller_1 = __webpack_require__(/*! ./controllers/restaurants.controller */ "./src/cramschool/controllers/restaurants.controller.ts");
const restaurants_service_1 = __webpack_require__(/*! ./services/restaurants.service */ "./src/cramschool/services/restaurants.service.ts");
const group_orders_controller_1 = __webpack_require__(/*! ./controllers/group-orders.controller */ "./src/cramschool/controllers/group-orders.controller.ts");
const group_orders_service_1 = __webpack_require__(/*! ./services/group-orders.service */ "./src/cramschool/services/group-orders.service.ts");
const orders_controller_1 = __webpack_require__(/*! ./controllers/orders.controller */ "./src/cramschool/controllers/orders.controller.ts");
const orders_service_1 = __webpack_require__(/*! ./services/orders.service */ "./src/cramschool/services/orders.service.ts");
const order_items_controller_1 = __webpack_require__(/*! ./controllers/order-items.controller */ "./src/cramschool/controllers/order-items.controller.ts");
const order_items_service_1 = __webpack_require__(/*! ./services/order-items.service */ "./src/cramschool/services/order-items.service.ts");
const content_templates_controller_1 = __webpack_require__(/*! ./controllers/content-templates.controller */ "./src/cramschool/controllers/content-templates.controller.ts");
const content_templates_service_1 = __webpack_require__(/*! ./services/content-templates.service */ "./src/cramschool/services/content-templates.service.ts");
const error_logs_controller_1 = __webpack_require__(/*! ./controllers/error-logs.controller */ "./src/cramschool/controllers/error-logs.controller.ts");
const error_logs_service_1 = __webpack_require__(/*! ./services/error-logs.service */ "./src/cramschool/services/error-logs.service.ts");
const student_mistake_notes_controller_1 = __webpack_require__(/*! ./controllers/student-mistake-notes.controller */ "./src/cramschool/controllers/student-mistake-notes.controller.ts");
const student_mistake_notes_service_1 = __webpack_require__(/*! ./services/student-mistake-notes.service */ "./src/cramschool/services/student-mistake-notes.service.ts");
const error_log_images_controller_1 = __webpack_require__(/*! ./controllers/error-log-images.controller */ "./src/cramschool/controllers/error-log-images.controller.ts");
const error_log_images_service_1 = __webpack_require__(/*! ./services/error-log-images.service */ "./src/cramschool/services/error-log-images.service.ts");
const student_mistake_note_images_controller_1 = __webpack_require__(/*! ./controllers/student-mistake-note-images.controller */ "./src/cramschool/controllers/student-mistake-note-images.controller.ts");
const student_mistake_note_images_service_1 = __webpack_require__(/*! ./services/student-mistake-note-images.service */ "./src/cramschool/services/student-mistake-note-images.service.ts");
const word_importer_service_1 = __webpack_require__(/*! ./services/word-importer.service */ "./src/cramschool/services/word-importer.service.ts");
const markdown_importer_service_1 = __webpack_require__(/*! ./services/markdown-importer.service */ "./src/cramschool/services/markdown-importer.service.ts");
let CramschoolModule = class CramschoolModule {
};
exports.CramschoolModule = CramschoolModule;
exports.CramschoolModule = CramschoolModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            students_controller_1.StudentsController,
            teachers_controller_1.TeachersController,
            courses_controller_1.CoursesController,
            enrollments_controller_1.EnrollmentsController,
            enrollment_periods_controller_1.EnrollmentPeriodsController,
            leaves_controller_1.LeavesController,
            questions_controller_1.QuestionsController,
            resources_controller_1.ResourcesController,
            student_groups_controller_1.StudentGroupsController,
            fees_controller_1.FeesController,
            media_controller_1.MediaController,
            attendances_controller_1.AttendancesController,
            sessions_controller_1.SessionsController,
            subjects_controller_1.SubjectsController,
            hashtags_controller_1.HashtagsController,
            question_tags_controller_1.QuestionTagsController,
            student_answers_controller_1.StudentAnswersController,
            restaurants_controller_1.RestaurantsController,
            group_orders_controller_1.GroupOrdersController,
            orders_controller_1.OrdersController,
            order_items_controller_1.OrderItemsController,
            content_templates_controller_1.ContentTemplatesController,
            error_logs_controller_1.ErrorLogsController,
            student_mistake_notes_controller_1.StudentMistakeNotesController,
            error_log_images_controller_1.ErrorLogImagesController,
            student_mistake_note_images_controller_1.StudentMistakeNoteImagesController,
        ],
        providers: [
            students_service_1.StudentsService,
            students_query_service_1.StudentsQueryService,
            students_fee_service_1.StudentsFeeService,
            students_permission_service_1.StudentsPermissionService,
            students_stats_service_1.StudentsStatsService,
            teachers_service_1.TeachersService,
            courses_service_1.CoursesService,
            enrollments_service_1.EnrollmentsService,
            enrollment_periods_service_1.EnrollmentPeriodsService,
            leaves_service_1.LeavesService,
            questions_service_1.QuestionsService,
            questions_permission_service_1.QuestionsPermissionService,
            questions_query_service_1.QuestionsQueryService,
            questions_export_service_1.QuestionsExportService,
            questions_import_service_1.QuestionsImportService,
            resources_service_1.ResourcesService,
            student_groups_service_1.StudentGroupsService,
            fees_service_1.FeesService,
            attendances_service_1.AttendancesService,
            sessions_service_1.SessionsService,
            subjects_service_1.SubjectsService,
            hashtags_service_1.HashtagsService,
            question_tags_service_1.QuestionTagsService,
            student_answers_service_1.StudentAnswersService,
            restaurants_service_1.RestaurantsService,
            group_orders_service_1.GroupOrdersService,
            orders_service_1.OrdersService,
            order_items_service_1.OrderItemsService,
            content_templates_service_1.ContentTemplatesService,
            error_logs_service_1.ErrorLogsService,
            student_mistake_notes_service_1.StudentMistakeNotesService,
            error_log_images_service_1.ErrorLogImagesService,
            student_mistake_note_images_service_1.StudentMistakeNoteImagesService,
            word_importer_service_1.WordImporterService,
            markdown_importer_service_1.MarkdownImporterService,
        ],
        exports: [
            students_service_1.StudentsService,
            teachers_service_1.TeachersService,
            courses_service_1.CoursesService,
        ],
    })
], CramschoolModule);


/***/ }),

/***/ "./src/cramschool/services/attendances.service.ts":
/*!********************************************************!*\
  !*** ./src/cramschool/services/attendances.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendancesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let AttendancesService = class AttendancesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAttendances(includeDeleted = false, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolAttendance.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    session: {
                        include: {
                            course: true,
                        },
                    },
                    student: true,
                },
                orderBy: {
                    session: {
                        sessionDate: 'desc',
                    },
                },
            }),
            this.prisma.cramschoolAttendance.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((a) => this.toAttendanceDto(a)), count, page, pageSize);
    }
    async getAttendance(id) {
        const attendance = await this.prisma.cramschoolAttendance.findUnique({
            where: { attendanceId: id },
            include: {
                session: {
                    include: {
                        course: true,
                    },
                },
                student: true,
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException(`Attendance with ID ${id} not found`);
        }
        return this.toAttendanceDto(attendance);
    }
    async createAttendance(createDto) {
        const attendance = await this.prisma.cramschoolAttendance.create({
            data: {
                sessionId: createDto.session_id,
                studentId: createDto.student_id,
                status: createDto.status || 'Absent',
            },
            include: {
                session: {
                    include: {
                        course: true,
                    },
                },
                student: true,
            },
        });
        return this.toAttendanceDto(attendance);
    }
    async updateAttendance(id, updateDto) {
        const attendance = await this.prisma.cramschoolAttendance.findUnique({
            where: { attendanceId: id },
        });
        if (!attendance) {
            throw new common_1.NotFoundException(`Attendance with ID ${id} not found`);
        }
        const updatedAttendance = await this.prisma.cramschoolAttendance.update({
            where: { attendanceId: id },
            data: {
                sessionId: updateDto.session_id,
                studentId: updateDto.student_id,
                status: updateDto.status,
            },
            include: {
                session: {
                    include: {
                        course: true,
                    },
                },
                student: true,
            },
        });
        return this.toAttendanceDto(updatedAttendance);
    }
    async deleteAttendance(id) {
        const attendance = await this.prisma.cramschoolAttendance.findUnique({
            where: { attendanceId: id },
        });
        if (!attendance) {
            throw new common_1.NotFoundException(`Attendance with ID ${id} not found`);
        }
        await this.prisma.cramschoolAttendance.update({
            where: { attendanceId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async restoreAttendance(id) {
        const attendance = await this.prisma.cramschoolAttendance.findUnique({
            where: { attendanceId: id },
        });
        if (!attendance) {
            throw new common_1.NotFoundException(`Attendance with ID ${id} not found`);
        }
        if (!attendance.isDeleted) {
            throw new common_1.NotFoundException(`Attendance with ID ${id} is not deleted`);
        }
        const restoredAttendance = await this.prisma.cramschoolAttendance.update({
            where: { attendanceId: id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
            include: {
                session: {
                    include: {
                        course: true,
                    },
                },
                student: true,
            },
        });
        return this.toAttendanceDto(restoredAttendance);
    }
    toAttendanceDto(attendance) {
        const result = {
            attendance_id: attendance.attendanceId,
            session_id: attendance.sessionId,
            student_id: attendance.studentId,
            status: attendance.status,
            is_deleted: attendance.isDeleted,
            deleted_at: attendance.deletedAt?.toISOString() || null,
            student_name: attendance.student?.name || undefined,
            session_id_display: attendance.session?.sessionId || undefined,
            course_name: attendance.session?.course?.courseName || undefined,
            session_date: attendance.session?.sessionDate
                ? attendance.session.sessionDate.toISOString().split('T')[0]
                : undefined,
        };
        return result;
    }
};
exports.AttendancesService = AttendancesService;
exports.AttendancesService = AttendancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AttendancesService);


/***/ }),

/***/ "./src/cramschool/services/content-templates.service.ts":
/*!**************************************************************!*\
  !*** ./src/cramschool/services/content-templates.service.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentTemplatesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let ContentTemplatesService = class ContentTemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getContentTemplates(userId, userRole, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        if (userRole !== 'TEACHER') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        const where = {
            OR: [
                { isPublic: true },
                { createdById: userId },
            ],
        };
        const [results, count] = await Promise.all([
            this.prisma.cramschoolContentTemplate.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: { templateId: 'desc' },
            }),
            this.prisma.cramschoolContentTemplate.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((t) => this.toContentTemplateDto(t)), count, page, pageSize);
    }
    async getContentTemplate(id, userId, userRole) {
        const template = await this.prisma.cramschoolContentTemplate.findUnique({
            where: { templateId: id },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException(`ContentTemplate with ID ${id} not found`);
        }
        if (userRole !== 'TEACHER') {
            throw new common_1.NotFoundException(`ContentTemplate with ID ${id} not found`);
        }
        if (!template.isPublic && template.createdById !== userId) {
            throw new common_1.NotFoundException(`ContentTemplate with ID ${id} not found`);
        }
        return this.toContentTemplateDto(template);
    }
    async createContentTemplate(createDto, userId) {
        const template = await this.prisma.cramschoolContentTemplate.create({
            data: {
                title: createDto.title,
                structure: createDto.structure || [],
                tiptapStructure: createDto.tiptap_structure ?? client_1.Prisma.DbNull,
                createdById: userId,
                isPublic: createDto.is_public || false,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        return this.toContentTemplateDto(template);
    }
    async updateContentTemplate(id, updateDto, userId) {
        const template = await this.prisma.cramschoolContentTemplate.findUnique({
            where: { templateId: id },
        });
        if (!template) {
            throw new common_1.NotFoundException(`ContentTemplate with ID ${id} not found`);
        }
        if (template.createdById !== userId) {
            throw new common_1.NotFoundException(`ContentTemplate with ID ${id} not found`);
        }
        const updatedTemplate = await this.prisma.cramschoolContentTemplate.update({
            where: { templateId: id },
            data: {
                title: updateDto.title,
                structure: updateDto.structure,
                tiptapStructure: updateDto.tiptap_structure !== undefined
                    ? (updateDto.tiptap_structure ?? client_1.Prisma.DbNull)
                    : undefined,
                isPublic: updateDto.is_public,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        return this.toContentTemplateDto(updatedTemplate);
    }
    async deleteContentTemplate(id, userId) {
        const template = await this.prisma.cramschoolContentTemplate.findUnique({
            where: { templateId: id },
        });
        if (!template) {
            throw new common_1.NotFoundException(`ContentTemplate with ID ${id} not found`);
        }
        if (template.createdById !== userId) {
            throw new common_1.NotFoundException(`ContentTemplate with ID ${id} not found`);
        }
        await this.prisma.cramschoolContentTemplate.delete({
            where: { templateId: id },
        });
    }
    toContentTemplateDto(template) {
        return {
            template_id: template.templateId,
            title: template.title,
            structure: template.structure,
            tiptap_structure: template.tiptapStructure || null,
            created_by: template.createdById || null,
            is_public: template.isPublic,
            tag_ids: template.tags?.map((t) => t.tag?.tagId || t.tagId) || [],
            created_at: template.createdAt?.toISOString(),
            updated_at: template.updatedAt?.toISOString(),
        };
    }
};
exports.ContentTemplatesService = ContentTemplatesService;
exports.ContentTemplatesService = ContentTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ContentTemplatesService);


/***/ }),

/***/ "./src/cramschool/services/courses.service.ts":
/*!****************************************************!*\
  !*** ./src/cramschool/services/courses.service.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoursesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let CoursesService = class CoursesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCourses(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolCourse.findMany({
                skip,
                take: pageSize,
                include: {
                    teacher: {
                        include: {
                            user: true,
                        },
                    },
                    enrollments: {
                        where: { isDeleted: false },
                        include: {
                            student: true,
                        },
                    },
                },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            }),
            this.prisma.cramschoolCourse.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((c) => this.toCourseDto(c)), count, page, pageSize);
    }
    async getCourse(id) {
        const course = await this.prisma.cramschoolCourse.findUnique({
            where: { courseId: id },
            include: {
                teacher: {
                    include: {
                        user: true,
                    },
                },
                enrollments: {
                    where: { isDeleted: false },
                    include: {
                        student: true,
                    },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        return this.toCourseDto(course);
    }
    async createCourse(createDto) {
        const course = await this.prisma.cramschoolCourse.create({
            data: {
                courseName: createDto.course_name,
                teacherId: createDto.teacher_id,
                startTime: createDto.start_time,
                endTime: createDto.end_time,
                dayOfWeek: createDto.day_of_week,
                feePerSession: createDto.fee_per_session,
                status: createDto.status || 'Active',
            },
        });
        return this.getCourse(course.courseId);
    }
    async updateCourse(id, updateDto) {
        const course = await this.prisma.cramschoolCourse.findUnique({
            where: { courseId: id },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        await this.prisma.cramschoolCourse.update({
            where: { courseId: id },
            data: {
                courseName: updateDto.course_name,
                teacherId: updateDto.teacher_id,
                startTime: updateDto.start_time,
                endTime: updateDto.end_time,
                dayOfWeek: updateDto.day_of_week,
                feePerSession: updateDto.fee_per_session,
                status: updateDto.status,
            },
        });
        return this.getCourse(id);
    }
    async deleteCourse(id) {
        const course = await this.prisma.cramschoolCourse.findUnique({
            where: { courseId: id },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        await this.prisma.cramschoolCourse.delete({
            where: { courseId: id },
        });
    }
    toCourseDto(course) {
        const enrollmentsCount = course.enrollments
            ? course.enrollments.filter((e) => !e.isDeleted).length
            : 0;
        const result = {
            course_id: course.courseId,
            course_name: course.courseName,
            teacher_id: course.teacherId,
            start_time: course.startTime,
            end_time: course.endTime,
            day_of_week: course.dayOfWeek,
            fee_per_session: Number(course.feePerSession),
            status: course.status,
            enrollments_count: enrollmentsCount,
        };
        return result;
    }
    async getStudentStatus(id) {
        const course = await this.prisma.cramschoolCourse.findUnique({
            where: { courseId: id },
            include: {
                enrollments: {
                    where: { isDeleted: false },
                    include: {
                        student: true,
                        periods: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        const todayLeaves = await this.prisma.cramschoolLeave.findMany({
            where: {
                courseId: id,
                leaveDate: today,
                isDeleted: false,
            },
            select: { studentId: true },
        });
        const todayLeaveStudentIds = new Set(todayLeaves.map((l) => l.studentId));
        let presentCount = 0;
        let leaveCount = 0;
        let inactiveCount = 0;
        for (const enrollment of course.enrollments) {
            const studentId = enrollment.studentId;
            let hasActivePeriod = false;
            for (const period of enrollment.periods) {
                const startDate = period.startDate.toISOString().split('T')[0];
                const endDate = period.endDate
                    ? period.endDate.toISOString().split('T')[0]
                    : null;
                if (startDate <= todayStr && (!endDate || endDate >= todayStr)) {
                    hasActivePeriod = true;
                    break;
                }
            }
            if (!hasActivePeriod) {
                inactiveCount++;
                continue;
            }
            if (todayLeaveStudentIds.has(studentId)) {
                leaveCount++;
            }
            else {
                presentCount++;
            }
        }
        return {
            course_id: course.courseId,
            course_name: course.courseName,
            total_students: course.enrollments.length,
            present_count: presentCount,
            leave_count: leaveCount,
            inactive_count: inactiveCount,
        };
    }
    async getResources(id, userId, userRole) {
        const course = await this.prisma.cramschoolCourse.findUnique({
            where: { courseId: id },
            include: {
                teacher: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        if (userRole === 'TEACHER') {
            const teacher = await this.prisma.cramschoolTeacher.findFirst({
                where: { userId },
            });
            if (!teacher || course.teacherId !== teacher.teacherId) {
                throw new common_1.NotFoundException('您沒有權限查看此課程的資源');
            }
        }
        else if (userRole !== 'ADMIN') {
            throw new common_1.NotFoundException('您沒有權限查看課程資源');
        }
        const resources = await this.prisma.cramschoolLearningResource.findMany({
            where: {
                courses: {
                    some: {
                        courseId: id,
                    },
                },
            },
            include: {
                courses: true,
            },
        });
        return resources.map((r) => ({
            resource_id: r.resourceId,
            title: r.title,
            mode: r.mode,
            course_ids: r.courses?.map((c) => c.courseId) || [],
            created_by: r.createdById || null,
            created_at: r.createdAt?.toISOString() || null,
            updated_at: r.updatedAt?.toISOString() || null,
        }));
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], CoursesService);


/***/ }),

/***/ "./src/cramschool/services/enrollment-periods.service.ts":
/*!***************************************************************!*\
  !*** ./src/cramschool/services/enrollment-periods.service.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnrollmentPeriodsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
let EnrollmentPeriodsService = class EnrollmentPeriodsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPeriods(enrollmentId) {
        const where = {};
        if (enrollmentId) {
            where.enrollmentId = enrollmentId;
        }
        const periods = await this.prisma.cramschoolEnrollmentPeriod.findMany({
            where,
            include: {
                enrollment: {
                    include: {
                        student: true,
                        course: true,
                    },
                },
            },
            orderBy: { startDate: 'asc' },
        });
        return periods.map((p) => this.toPeriodDto(p));
    }
    async getPeriod(id) {
        const period = await this.prisma.cramschoolEnrollmentPeriod.findUnique({
            where: { periodId: id },
            include: {
                enrollment: true,
            },
        });
        if (!period) {
            throw new common_1.NotFoundException(`Enrollment period with ID ${id} not found`);
        }
        return this.toPeriodDto(period);
    }
    async createPeriod(createDto) {
        const period = await this.prisma.cramschoolEnrollmentPeriod.create({
            data: {
                enrollmentId: createDto.enrollment_id,
                startDate: new Date(createDto.start_date),
                endDate: createDto.end_date ? new Date(createDto.end_date) : null,
                isActive: createDto.is_active !== undefined ? createDto.is_active : true,
                notes: createDto.notes || null,
            },
        });
        return this.getPeriod(period.periodId);
    }
    async updatePeriod(id, updateDto) {
        const period = await this.prisma.cramschoolEnrollmentPeriod.findUnique({
            where: { periodId: id },
        });
        if (!period) {
            throw new common_1.NotFoundException(`Enrollment period with ID ${id} not found`);
        }
        await this.prisma.cramschoolEnrollmentPeriod.update({
            where: { periodId: id },
            data: {
                startDate: updateDto.start_date ? new Date(updateDto.start_date) : undefined,
                endDate: updateDto.end_date !== undefined ? (updateDto.end_date ? new Date(updateDto.end_date) : null) : undefined,
                isActive: updateDto.is_active,
                notes: updateDto.notes,
            },
        });
        return this.getPeriod(id);
    }
    async deletePeriod(id) {
        const period = await this.prisma.cramschoolEnrollmentPeriod.findUnique({
            where: { periodId: id },
        });
        if (!period) {
            throw new common_1.NotFoundException(`Enrollment period with ID ${id} not found`);
        }
        await this.prisma.cramschoolEnrollmentPeriod.delete({
            where: { periodId: id },
        });
    }
    toPeriodDto(period) {
        return {
            period_id: period.periodId,
            enrollment_id: period.enrollmentId,
            start_date: period.startDate.toISOString().split('T')[0],
            end_date: period.endDate ? period.endDate.toISOString().split('T')[0] : null,
            is_active: period.isActive,
            notes: period.notes || null,
        };
    }
};
exports.EnrollmentPeriodsService = EnrollmentPeriodsService;
exports.EnrollmentPeriodsService = EnrollmentPeriodsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], EnrollmentPeriodsService);


/***/ }),

/***/ "./src/cramschool/services/enrollments.service.ts":
/*!********************************************************!*\
  !*** ./src/cramschool/services/enrollments.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnrollmentsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let EnrollmentsService = class EnrollmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEnrollments(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolStudentEnrollment.findMany({
                skip,
                take: pageSize,
                include: {
                    student: true,
                    course: {
                        include: {
                            teacher: true,
                        },
                    },
                    periods: {
                        where: { isActive: true },
                        orderBy: { startDate: 'asc' },
                    },
                },
                where: { isDeleted: false },
                orderBy: { enrollDate: 'desc' },
            }),
            this.prisma.cramschoolStudentEnrollment.count({
                where: { isDeleted: false },
            }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((e) => this.toEnrollmentDto(e)), count, page, pageSize);
    }
    async getEnrollment(id) {
        const enrollment = await this.prisma.cramschoolStudentEnrollment.findUnique({
            where: { enrollmentId: id },
            include: {
                student: true,
                course: true,
                periods: true,
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID ${id} not found`);
        }
        return this.toEnrollmentDto(enrollment);
    }
    async createEnrollment(createDto) {
        let enrollDate = createDto.enroll_date;
        if (typeof enrollDate === 'string' && enrollDate.includes('/')) {
            enrollDate = enrollDate.replace(/\//g, '-');
        }
        const enrollment = await this.prisma.cramschoolStudentEnrollment.create({
            data: {
                studentId: createDto.student_id,
                courseId: createDto.course_id,
                enrollDate: new Date(enrollDate),
                discountRate: createDto.discount_rate || 0,
                isActive: createDto.is_active !== undefined ? createDto.is_active : true,
            },
        });
        return this.getEnrollment(enrollment.enrollmentId);
    }
    async updateEnrollment(id, updateDto) {
        const enrollment = await this.prisma.cramschoolStudentEnrollment.findUnique({
            where: { enrollmentId: id },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID ${id} not found`);
        }
        await this.prisma.cramschoolStudentEnrollment.update({
            where: { enrollmentId: id },
            data: {
                enrollDate: updateDto.enroll_date ? new Date(updateDto.enroll_date) : undefined,
                discountRate: updateDto.discount_rate,
                isActive: updateDto.is_active,
            },
        });
        return this.getEnrollment(id);
    }
    async deleteEnrollment(id) {
        const enrollment = await this.prisma.cramschoolStudentEnrollment.findUnique({
            where: { enrollmentId: id },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID ${id} not found`);
        }
        await this.prisma.cramschoolStudentEnrollment.update({
            where: { enrollmentId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    toEnrollmentDto(enrollment) {
        return {
            enrollment_id: enrollment.enrollmentId,
            student_id: enrollment.studentId,
            course_id: enrollment.courseId,
            enroll_date: enrollment.enrollDate.toISOString().split('T')[0],
            discount_rate: Number(enrollment.discountRate),
            is_active: enrollment.isActive,
            is_deleted: enrollment.isDeleted,
            deleted_at: enrollment.deletedAt?.toISOString() || null,
            course_name: enrollment.course?.courseName || undefined,
            student_name: enrollment.student?.name || undefined,
        };
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], EnrollmentsService);


/***/ }),

/***/ "./src/cramschool/services/error-log-images.service.ts":
/*!*************************************************************!*\
  !*** ./src/cramschool/services/error-log-images.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorLogImagesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let ErrorLogImagesService = class ErrorLogImagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getErrorLogImages(errorLogId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (errorLogId) {
            where.errorLogId = errorLogId;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolErrorLogImage.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [{ sortOrder: 'asc' }, { imageId: 'asc' }],
            }),
            this.prisma.cramschoolErrorLogImage.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((img) => this.toErrorLogImageDto(img)), count, page, pageSize);
    }
    async getErrorLogImage(id) {
        const image = await this.prisma.cramschoolErrorLogImage.findUnique({
            where: { imageId: id },
        });
        if (!image) {
            throw new common_1.NotFoundException(`ErrorLogImage with ID ${id} not found`);
        }
        return this.toErrorLogImageDto(image);
    }
    async createErrorLogImage(createDto) {
        const image = await this.prisma.cramschoolErrorLogImage.create({
            data: {
                errorLogId: createDto.error_log_id,
                imagePath: createDto.image_path,
                caption: createDto.caption || null,
                sortOrder: createDto.sort_order || 0,
            },
        });
        return this.toErrorLogImageDto(image);
    }
    async updateErrorLogImage(id, updateDto) {
        const image = await this.prisma.cramschoolErrorLogImage.findUnique({
            where: { imageId: id },
        });
        if (!image) {
            throw new common_1.NotFoundException(`ErrorLogImage with ID ${id} not found`);
        }
        const updatedImage = await this.prisma.cramschoolErrorLogImage.update({
            where: { imageId: id },
            data: {
                caption: updateDto.caption !== undefined ? updateDto.caption : undefined,
                sortOrder: updateDto.sort_order !== undefined ? updateDto.sort_order : undefined,
            },
        });
        return this.toErrorLogImageDto(updatedImage);
    }
    async deleteErrorLogImage(id) {
        const image = await this.prisma.cramschoolErrorLogImage.findUnique({
            where: { imageId: id },
        });
        if (!image) {
            throw new common_1.NotFoundException(`ErrorLogImage with ID ${id} not found`);
        }
        await this.prisma.cramschoolErrorLogImage.delete({
            where: { imageId: id },
        });
    }
    toErrorLogImageDto(image) {
        return {
            image_id: image.imageId,
            error_log_id: image.errorLogId,
            image_path: image.imagePath,
            caption: image.caption || null,
            sort_order: image.sortOrder,
            created_at: image.createdAt?.toISOString(),
        };
    }
};
exports.ErrorLogImagesService = ErrorLogImagesService;
exports.ErrorLogImagesService = ErrorLogImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ErrorLogImagesService);


/***/ }),

/***/ "./src/cramschool/services/error-logs.service.ts":
/*!*******************************************************!*\
  !*** ./src/cramschool/services/error-logs.service.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorLogsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs/promises */ "fs/promises");
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
let ErrorLogsService = class ErrorLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getErrorLogs(userId, userRole, includeDeleted = false, studentId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        if (userRole === 'ACCOUNTANT') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        if (userRole === 'STUDENT') {
            const student = await this.prisma.cramschoolStudent.findFirst({
                where: { userId },
            });
            if (student) {
                where.studentId = student.studentId;
            }
            else {
                return { count: 0, results: [], page: 1, page_size: pageSize };
            }
        }
        if (studentId) {
            where.studentId = studentId;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolErrorLog.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    student: true,
                    question: {
                        include: {
                            subject: true,
                        },
                    },
                },
                orderBy: { errorLogId: 'desc' },
            }),
            this.prisma.cramschoolErrorLog.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((el) => this.toErrorLogDto(el)), count, page, pageSize);
    }
    async getErrorLog(id) {
        const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
            where: { errorLogId: id },
            include: {
                student: true,
                question: {
                    include: {
                        subject: true,
                    },
                },
            },
        });
        if (!errorLog) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${id} not found`);
        }
        return this.toErrorLogDto(errorLog);
    }
    async createErrorLog(createDto) {
        const errorLog = await this.prisma.cramschoolErrorLog.create({
            data: {
                studentId: createDto.student_id,
                questionId: createDto.question_id,
                errorCount: createDto.error_count || 1,
                reviewStatus: createDto.review_status || 'New',
            },
            include: {
                student: true,
                question: {
                    include: {
                        subject: true,
                    },
                },
            },
        });
        return this.toErrorLogDto(errorLog);
    }
    async updateErrorLog(id, updateDto) {
        const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
            where: { errorLogId: id },
        });
        if (!errorLog) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${id} not found`);
        }
        const updatedErrorLog = await this.prisma.cramschoolErrorLog.update({
            where: { errorLogId: id },
            data: {
                studentId: updateDto.student_id,
                questionId: updateDto.question_id,
                errorCount: updateDto.error_count,
                reviewStatus: updateDto.review_status,
            },
            include: {
                student: true,
                question: {
                    include: {
                        subject: true,
                    },
                },
            },
        });
        return this.toErrorLogDto(updatedErrorLog);
    }
    async deleteErrorLog(id) {
        const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
            where: { errorLogId: id },
        });
        if (!errorLog) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${id} not found`);
        }
        await this.prisma.cramschoolErrorLog.update({
            where: { errorLogId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async restoreErrorLog(id) {
        const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
            where: { errorLogId: id },
        });
        if (!errorLog) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${id} not found`);
        }
        if (!errorLog.isDeleted) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${id} is not deleted`);
        }
        const restoredErrorLog = await this.prisma.cramschoolErrorLog.update({
            where: { errorLogId: id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
            include: {
                student: true,
                question: {
                    include: {
                        subject: true,
                    },
                },
            },
        });
        return this.toErrorLogDto(restoredErrorLog);
    }
    async importToQuestionBank(id, userId) {
        const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
            where: { errorLogId: id },
            include: {
                question: true,
                student: true,
            },
        });
        if (!errorLog) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${id} not found`);
        }
        const existing = await this.prisma.cramschoolQuestionBank.findFirst({
            where: {
                importedFromErrorLogId: id,
            },
        });
        if (existing) {
            return existing;
        }
        const question = errorLog.question;
        const newQuestion = await this.prisma.cramschoolQuestionBank.create({
            data: {
                subjectId: question.subjectId,
                level: question.level,
                chapter: question.chapter,
                content: question.content,
                imagePath: question.imagePath,
                correctAnswer: question.correctAnswer,
                difficulty: question.difficulty,
                questionNumber: question.questionNumber,
                origin: question.origin,
                originDetail: question.originDetail,
                solutionContent: question.solutionContent,
                source: 'imported_from_error_log',
                createdById: userId,
                importedFromErrorLogId: id,
                importedStudentId: errorLog.studentId,
            },
        });
        return newQuestion;
    }
    async uploadImages(errorLogId, files) {
        const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
            where: { errorLogId },
        });
        if (!errorLog) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${errorLogId} not found`);
        }
        const maxSortOrder = await this.prisma.cramschoolErrorLogImage.aggregate({
            where: { errorLogId },
            _max: { sortOrder: true },
        });
        const currentMax = maxSortOrder._max.sortOrder || 0;
        const created = [];
        for (let idx = 0; idx < files.length; idx++) {
            const file = files[idx];
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const fileExt = path.extname(file.originalname).slice(1).toLowerCase();
            if (!allowedExtensions.includes(fileExt)) {
                throw new common_1.BadRequestException(`不支援的文件類型。允許的類型：${allowedExtensions.join(', ')}`);
            }
            if (file.size > 5 * 1024 * 1024) {
                throw new common_1.BadRequestException('圖片文件大小不能超過 5MB');
            }
            const now = new Date();
            const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
            const uniqueFilename = `${(0, uuid_1.v4)().replace(/-/g, '')}.${fileExt}`;
            const relativePath = `error_log_images/${dateFolder}/${uniqueFilename}`;
            const mediaRoot = process.env.MEDIA_ROOT || './media';
            const fullPath = path.join(mediaRoot, relativePath);
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(fullPath, file.buffer);
            const mediaUrl = process.env.MEDIA_URL || '/media/';
            const imageUrl = mediaUrl.startsWith('http')
                ? `${mediaUrl}${relativePath}`
                : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;
            const image = await this.prisma.cramschoolErrorLogImage.create({
                data: {
                    errorLogId,
                    imagePath: relativePath,
                    sortOrder: currentMax + idx + 1,
                },
            });
            created.push({
                image_id: image.imageId,
                error_log_id: image.errorLogId,
                image_path: image.imagePath,
                image_url: imageUrl,
                caption: image.caption || null,
                sort_order: image.sortOrder,
                created_at: image.createdAt?.toISOString(),
            });
        }
        return created;
    }
    async reorderImages(errorLogId, imageIds) {
        const errorLog = await this.prisma.cramschoolErrorLog.findUnique({
            where: { errorLogId },
        });
        if (!errorLog) {
            throw new common_1.NotFoundException(`ErrorLog with ID ${errorLogId} not found`);
        }
        const images = await this.prisma.cramschoolErrorLogImage.findMany({
            where: {
                errorLogId,
                imageId: { in: imageIds },
            },
        });
        if (images.length !== imageIds.length) {
            throw new common_1.BadRequestException('image_ids 包含不屬於此錯題的圖片');
        }
        const updates = imageIds.map((imageId, index) => this.prisma.cramschoolErrorLogImage.update({
            where: { imageId },
            data: { sortOrder: index + 1 },
        }));
        await Promise.all(updates);
        return { success: true };
    }
    toErrorLogDto(errorLog) {
        return {
            error_log_id: errorLog.errorLogId,
            student_id: errorLog.studentId,
            question_id: errorLog.questionId,
            error_count: errorLog.errorCount,
            review_status: errorLog.reviewStatus,
            is_deleted: errorLog.isDeleted,
            deleted_at: errorLog.deletedAt?.toISOString() || null,
        };
    }
};
exports.ErrorLogsService = ErrorLogsService;
exports.ErrorLogsService = ErrorLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ErrorLogsService);


/***/ }),

/***/ "./src/cramschool/services/fees.service.ts":
/*!*************************************************!*\
  !*** ./src/cramschool/services/fees.service.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FeesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let FeesService = class FeesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFees(page = 1, pageSize = 10, studentId, includeDeleted = false) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (studentId) {
            where.studentId = studentId;
        }
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolExtraFee.findMany({
                skip,
                take: pageSize,
                where,
                include: {
                    student: {
                        select: {
                            studentId: true,
                            name: true,
                        },
                    },
                },
                orderBy: { feeDate: 'desc' },
            }),
            this.prisma.cramschoolExtraFee.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((fee) => this.toFeeDto(fee)), count, page, pageSize);
    }
    async getFee(id) {
        const fee = await this.prisma.cramschoolExtraFee.findUnique({
            where: { feeId: id },
            include: {
                student: {
                    select: {
                        studentId: true,
                        name: true,
                    },
                },
            },
        });
        if (!fee) {
            throw new common_1.NotFoundException(`Fee with ID ${id} not found`);
        }
        return this.toFeeDto(fee);
    }
    async createFee(createDto) {
        const fee = await this.prisma.cramschoolExtraFee.create({
            data: {
                studentId: createDto.student_id,
                item: createDto.item,
                amount: createDto.amount,
                feeDate: new Date(createDto.fee_date),
                paymentStatus: createDto.payment_status || 'Unpaid',
                notes: createDto.notes || null,
                paidAt: createDto.paid_at ? new Date(createDto.paid_at) : null,
            },
            include: {
                student: {
                    select: {
                        studentId: true,
                        name: true,
                    },
                },
            },
        });
        return this.toFeeDto(fee);
    }
    async updateFee(id, updateDto) {
        const fee = await this.prisma.cramschoolExtraFee.findUnique({
            where: { feeId: id },
        });
        if (!fee) {
            throw new common_1.NotFoundException(`Fee with ID ${id} not found`);
        }
        const updatedFee = await this.prisma.cramschoolExtraFee.update({
            where: { feeId: id },
            data: {
                studentId: updateDto.student_id,
                item: updateDto.item,
                amount: updateDto.amount,
                feeDate: updateDto.fee_date ? new Date(updateDto.fee_date) : undefined,
                paymentStatus: updateDto.payment_status,
                notes: updateDto.notes,
                paidAt: updateDto.paid_at ? new Date(updateDto.paid_at) : updateDto.paid_at === null ? null : undefined,
            },
            include: {
                student: {
                    select: {
                        studentId: true,
                        name: true,
                    },
                },
            },
        });
        return this.toFeeDto(updatedFee);
    }
    async deleteFee(id) {
        const fee = await this.prisma.cramschoolExtraFee.findUnique({
            where: { feeId: id },
        });
        if (!fee) {
            throw new common_1.NotFoundException(`Fee with ID ${id} not found`);
        }
        await this.prisma.cramschoolExtraFee.update({
            where: { feeId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async batchUpdateStatus(batchUpdateDto) {
        const { fee_ids, payment_status } = batchUpdateDto;
        if (fee_ids.length === 0) {
            throw new common_1.BadRequestException('fee_ids 不能為空');
        }
        const result = await this.prisma.cramschoolExtraFee.updateMany({
            where: {
                feeId: { in: fee_ids },
            },
            data: {
                paymentStatus: payment_status,
                paidAt: payment_status === 'Paid' ? new Date() : null,
            },
        });
        return { updated: result.count };
    }
    toFeeDto(fee) {
        return {
            fee_id: fee.feeId,
            student_id: fee.studentId,
            item: fee.item,
            amount: Number(fee.amount),
            fee_date: fee.feeDate.toISOString().split('T')[0],
            payment_status: fee.paymentStatus,
            notes: fee.notes || null,
            paid_at: fee.paidAt?.toISOString() || null,
            is_deleted: fee.isDeleted,
            deleted_at: fee.deletedAt?.toISOString() || null,
            student_name: fee.student?.name || undefined,
        };
    }
};
exports.FeesService = FeesService;
exports.FeesService = FeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], FeesService);


/***/ }),

/***/ "./src/cramschool/services/group-orders.service.ts":
/*!*********************************************************!*\
  !*** ./src/cramschool/services/group-orders.service.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupOrdersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let GroupOrdersService = class GroupOrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGroupOrders(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolGroupOrder.findMany({
                skip,
                take: pageSize,
                include: {
                    restaurant: true,
                    orders: {
                        where: {
                            status: { in: ['Pending', 'Confirmed'] },
                            isDeleted: false,
                        },
                    },
                },
                orderBy: { groupOrderId: 'desc' },
            }),
            this.prisma.cramschoolGroupOrder.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((go) => this.toGroupOrderDto(go)), count, page, pageSize);
    }
    async getGroupOrder(id) {
        const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
            where: { groupOrderId: id },
            include: {
                restaurant: true,
                orders: {
                    where: {
                        status: { in: ['Pending', 'Confirmed'] },
                        isDeleted: false,
                    },
                },
            },
        });
        if (!groupOrder) {
            throw new common_1.NotFoundException(`GroupOrder with ID ${id} not found`);
        }
        return this.toGroupOrderDto(groupOrder);
    }
    async createGroupOrder(createDto, _userId) {
        const orderLink = `group-order-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const groupOrder = await this.prisma.cramschoolGroupOrder.create({
            data: {
                restaurantId: createDto.restaurant_id,
                title: createDto.title,
                orderLink,
                status: createDto.status || 'Open',
                deadline: new Date(createDto.deadline),
                createdById: createDto.created_by_id || null,
            },
            include: {
                restaurant: true,
                orders: true,
            },
        });
        return this.toGroupOrderDto(groupOrder);
    }
    async updateGroupOrder(id, updateDto) {
        const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
            where: { groupOrderId: id },
        });
        if (!groupOrder) {
            throw new common_1.NotFoundException(`GroupOrder with ID ${id} not found`);
        }
        const updatedGroupOrder = await this.prisma.cramschoolGroupOrder.update({
            where: { groupOrderId: id },
            data: {
                restaurantId: updateDto.restaurant_id,
                title: updateDto.title,
                orderLink: updateDto.order_link,
                status: updateDto.status,
                deadline: updateDto.deadline ? new Date(updateDto.deadline) : undefined,
                createdById: updateDto.created_by_id !== undefined ? updateDto.created_by_id : undefined,
            },
            include: {
                restaurant: true,
                orders: {
                    where: {
                        status: { in: ['Pending', 'Confirmed'] },
                        isDeleted: false,
                    },
                },
            },
        });
        return this.toGroupOrderDto(updatedGroupOrder);
    }
    async deleteGroupOrder(id) {
        const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
            where: { groupOrderId: id },
        });
        if (!groupOrder) {
            throw new common_1.NotFoundException(`GroupOrder with ID ${id} not found`);
        }
        await this.prisma.cramschoolGroupOrder.delete({
            where: { groupOrderId: id },
        });
    }
    async completeGroupOrder(id, userId, userRole) {
        const groupOrder = await this.prisma.cramschoolGroupOrder.findUnique({
            where: { groupOrderId: id },
            include: {
                restaurant: true,
                orders: {
                    where: {
                        status: { in: ['Pending', 'Confirmed'] },
                        isDeleted: false,
                    },
                    include: {
                        student: true,
                    },
                },
            },
        });
        if (!groupOrder) {
            throw new common_1.NotFoundException(`GroupOrder with ID ${id} not found`);
        }
        const isAccountant = userRole === 'ACCOUNTANT';
        const isOwnerTeacher = userRole === 'TEACHER' && groupOrder.createdById === userId;
        if (!isAccountant && !isOwnerTeacher) {
            throw new common_1.ForbiddenException('只有會計或發起該團購的老師可以完成團購');
        }
        const updatedGroupOrder = await this.prisma.cramschoolGroupOrder.update({
            where: { groupOrderId: id },
            data: {
                status: 'Completed',
                closedAt: new Date(),
            },
            include: {
                restaurant: true,
                orders: {
                    where: {
                        status: { in: ['Pending', 'Confirmed'] },
                        isDeleted: false,
                    },
                    include: {
                        student: true,
                    },
                },
            },
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (const order of updatedGroupOrder.orders) {
            const existingFee = await this.prisma.cramschoolExtraFee.findFirst({
                where: {
                    studentId: order.studentId,
                    item: 'Meal',
                    amount: order.totalAmount,
                    feeDate: today,
                    isDeleted: false,
                },
            });
            if (!existingFee) {
                const teacher = groupOrder.createdById
                    ? await this.prisma.cramschoolTeacher.findUnique({
                        where: { teacherId: groupOrder.createdById },
                    })
                    : null;
                const teacherName = teacher?.name || '未知';
                const restaurantName = updatedGroupOrder.restaurant?.name || '未知';
                const notes = `餐費/團購：${updatedGroupOrder.title}｜店家：${restaurantName}｜發起老師：${teacherName}｜團購ID:${updatedGroupOrder.groupOrderId}｜訂單ID:${order.orderId}`;
                await this.prisma.cramschoolExtraFee.create({
                    data: {
                        studentId: order.studentId,
                        item: 'Meal',
                        amount: order.totalAmount,
                        feeDate: today,
                        paymentStatus: 'Unpaid',
                        notes,
                    },
                });
            }
        }
        return this.toGroupOrderDto(updatedGroupOrder);
    }
    toGroupOrderDto(groupOrder) {
        const _ordersCount = groupOrder.orders?.length || 0;
        const _totalAmount = groupOrder.orders?.reduce((sum, o) => sum + Number(o._totalAmount || 0), 0) || 0;
        return {
            group_order_id: groupOrder.groupOrderId,
            restaurant_id: groupOrder.restaurantId,
            title: groupOrder.title,
            order_link: groupOrder.orderLink,
            status: groupOrder.status,
            deadline: groupOrder.deadline.toISOString(),
            created_by_id: groupOrder.createdById || null,
            created_at: groupOrder.createdAt?.toISOString(),
            closed_at: groupOrder.closedAt?.toISOString() || null,
        };
    }
};
exports.GroupOrdersService = GroupOrdersService;
exports.GroupOrdersService = GroupOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], GroupOrdersService);


/***/ }),

/***/ "./src/cramschool/services/hashtags.service.ts":
/*!*****************************************************!*\
  !*** ./src/cramschool/services/hashtags.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HashtagsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let HashtagsService = class HashtagsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHashtags(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolHashtag.findMany({
                skip,
                take: pageSize,
                include: {
                    creator: true,
                },
                orderBy: { tagName: 'asc' },
            }),
            this.prisma.cramschoolHashtag.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((h) => this.toHashtagDto(h)), count, page, pageSize);
    }
    async getHashtag(id) {
        const hashtag = await this.prisma.cramschoolHashtag.findUnique({
            where: { tagId: id },
            include: {
                creator: true,
            },
        });
        if (!hashtag) {
            throw new common_1.NotFoundException(`Hashtag with ID ${id} not found`);
        }
        return this.toHashtagDto(hashtag);
    }
    async createHashtag(createDto) {
        const hashtag = await this.prisma.cramschoolHashtag.create({
            data: {
                tagName: createDto.tag_name,
                creatorId: createDto.creator_id || null,
            },
            include: {
                creator: true,
            },
        });
        return this.toHashtagDto(hashtag);
    }
    async updateHashtag(id, updateDto) {
        const hashtag = await this.prisma.cramschoolHashtag.findUnique({
            where: { tagId: id },
        });
        if (!hashtag) {
            throw new common_1.NotFoundException(`Hashtag with ID ${id} not found`);
        }
        const updatedHashtag = await this.prisma.cramschoolHashtag.update({
            where: { tagId: id },
            data: {
                tagName: updateDto.tag_name,
                creatorId: updateDto.creator_id !== undefined ? updateDto.creator_id : undefined,
            },
            include: {
                creator: true,
            },
        });
        return this.toHashtagDto(updatedHashtag);
    }
    async deleteHashtag(id) {
        const hashtag = await this.prisma.cramschoolHashtag.findUnique({
            where: { tagId: id },
        });
        if (!hashtag) {
            throw new common_1.NotFoundException(`Hashtag with ID ${id} not found`);
        }
        await this.prisma.cramschoolHashtag.delete({
            where: { tagId: id },
        });
    }
    toHashtagDto(hashtag) {
        const result = {
            tag_id: hashtag.tagId,
            tag_name: hashtag.tagName,
            creator_id: hashtag.creatorId || null,
            creator_name: hashtag.creator?.name || undefined,
        };
        return result;
    }
};
exports.HashtagsService = HashtagsService;
exports.HashtagsService = HashtagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], HashtagsService);


/***/ }),

/***/ "./src/cramschool/services/leaves.service.ts":
/*!***************************************************!*\
  !*** ./src/cramschool/services/leaves.service.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LeavesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let LeavesService = class LeavesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeaves(includeDeleted = false, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolLeave.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    student: true,
                    course: true,
                },
                orderBy: { leaveDate: 'desc' },
            }),
            this.prisma.cramschoolLeave.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((l) => this.toLeaveDto(l)), count, page, pageSize);
    }
    async getLeave(id) {
        const leave = await this.prisma.cramschoolLeave.findUnique({
            where: { leaveId: id },
            include: {
                student: true,
                course: true,
            },
        });
        if (!leave) {
            throw new common_1.NotFoundException(`Leave with ID ${id} not found`);
        }
        return this.toLeaveDto(leave);
    }
    async createLeave(createDto) {
        const enrollment = await this.prisma.cramschoolStudentEnrollment.findFirst({
            where: {
                studentId: createDto.student_id,
                courseId: createDto.course_id,
                isDeleted: false,
            },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException(`學生未報名此課程，無法為該課程請假`);
        }
        const leave = await this.prisma.cramschoolLeave.create({
            data: {
                studentId: createDto.student_id,
                courseId: createDto.course_id,
                leaveDate: new Date(createDto.leave_date),
                reason: createDto.reason,
                approvalStatus: createDto.approval_status || 'Pending',
            },
        });
        return await this.getLeave(leave.leaveId);
    }
    async updateLeave(id, updateDto) {
        const leave = await this.prisma.cramschoolLeave.findUnique({
            where: { leaveId: id },
        });
        if (!leave) {
            throw new common_1.NotFoundException(`Leave with ID ${id} not found`);
        }
        const studentId = updateDto.student_id !== undefined ? updateDto.student_id : leave.studentId;
        const courseId = updateDto.course_id !== undefined ? updateDto.course_id : leave.courseId;
        if (updateDto.student_id !== undefined || updateDto.course_id !== undefined) {
            const enrollment = await this.prisma.cramschoolStudentEnrollment.findFirst({
                where: {
                    studentId: studentId,
                    courseId: courseId,
                    isDeleted: false,
                },
            });
            if (!enrollment) {
                throw new common_1.BadRequestException(`學生未報名此課程，無法為該課程請假`);
            }
        }
        await this.prisma.cramschoolLeave.update({
            where: { leaveId: id },
            data: {
                studentId: updateDto.student_id !== undefined ? updateDto.student_id : undefined,
                courseId: updateDto.course_id !== undefined ? updateDto.course_id : undefined,
                leaveDate: updateDto.leave_date ? new Date(updateDto.leave_date) : undefined,
                reason: updateDto.reason,
                approvalStatus: updateDto.approval_status,
            },
        });
        return this.getLeave(id);
    }
    async deleteLeave(id) {
        const leave = await this.prisma.cramschoolLeave.findUnique({
            where: { leaveId: id },
        });
        if (!leave) {
            throw new common_1.NotFoundException(`Leave with ID ${id} not found`);
        }
        await this.prisma.cramschoolLeave.update({
            where: { leaveId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async restoreLeave(id) {
        const leave = await this.prisma.cramschoolLeave.findUnique({
            where: { leaveId: id },
        });
        if (!leave) {
            throw new common_1.NotFoundException(`Leave with ID ${id} not found`);
        }
        await this.prisma.cramschoolLeave.update({
            where: { leaveId: id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });
        return this.getLeave(id);
    }
    toLeaveDto(leave) {
        const result = {
            leave_id: leave.leaveId,
            student_id: leave.studentId,
            course_id: leave.courseId,
            leave_date: leave.leaveDate.toISOString().split('T')[0],
            reason: leave.reason,
            approval_status: leave.approvalStatus,
            is_deleted: leave.isDeleted,
            deleted_at: leave.deletedAt?.toISOString() || null,
            course_name: leave.course?.courseName || undefined,
            student_name: leave.student?.name || undefined,
        };
        return result;
    }
};
exports.LeavesService = LeavesService;
exports.LeavesService = LeavesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], LeavesService);


/***/ }),

/***/ "./src/cramschool/services/markdown-importer.service.ts":
/*!**************************************************************!*\
  !*** ./src/cramschool/services/markdown-importer.service.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarkdownImporterService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
let MarkdownImporterService = class MarkdownImporterService {
    async importQuestions(markdownContent, imagesDict, defaultSubjectId, defaultLevel, defaultChapter, saveImagesFunc) {
        const errors = [];
        const questions = [];
        try {
            const lines = markdownContent.split('\n');
            let currentLines = [];
            let inQuestion = false;
            for (let idx = 0; idx < lines.length; idx++) {
                const line = lines[idx];
                if (/^\d+\.\s+\*\*【題號】/.test(line)) {
                    if (currentLines.length > 0) {
                        const parsedQ = this.parseSingleQuestion(currentLines, defaultSubjectId, defaultLevel, defaultChapter);
                        if (parsedQ) {
                            questions.push(parsedQ);
                        }
                    }
                    currentLines = [line];
                    inQuestion = true;
                }
                else if (inQuestion) {
                    currentLines.push(line);
                }
            }
            if (currentLines.length > 0) {
                const parsedQ = this.parseSingleQuestion(currentLines, defaultSubjectId, defaultLevel, defaultChapter);
                if (parsedQ) {
                    questions.push(parsedQ);
                }
            }
            if (saveImagesFunc && imagesDict && Object.keys(imagesDict).length > 0) {
                const imageMapping = {};
                for (const [filename, fileBytes] of Object.entries(imagesDict)) {
                    try {
                        const ext = filename.split('.').pop() || 'png';
                        const uniqueFilename = `${(0, uuid_1.v4)().replace(/-/g, '')}.${ext}`;
                        const imageUrl = await saveImagesFunc(fileBytes, uniqueFilename);
                        imageMapping[filename] = imageUrl;
                        imageMapping[`./media/${filename}`] = imageUrl;
                    }
                    catch (error) {
                        errors.push(`上傳圖片 ${filename} 失敗：${error.message}`);
                    }
                }
                for (const question of questions) {
                    question.content = this.replaceImagePaths(question.content, imageMapping);
                    question.correct_answer = this.replaceImagePaths(question.correct_answer, imageMapping);
                    if (question.solution_content?.text) {
                        question.solution_content.text = this.replaceImagePaths(question.solution_content.text, imageMapping);
                    }
                }
            }
            return { questions, errors };
        }
        catch (error) {
            errors.push(`解析 Markdown 失敗：${error.message}`);
            return { questions, errors };
        }
    }
    parseSingleQuestion(lines, subjectId, level, chapter) {
        try {
            const firstLine = lines[0] || '';
            const questionNumberMatch = firstLine.match(/【題號】：(\w+)/);
            const questionNumber = questionNumberMatch ? questionNumberMatch[1] : '';
            const difficultyMatch = firstLine.match(/【難易度】：(易|中|難)/);
            const difficultyStr = difficultyMatch ? difficultyMatch[1] : '中';
            const difficulty = { 易: 1, 中: 3, 難: 5 }[difficultyStr] || 3;
            const originMatch = firstLine.match(/【出處】：([^　]+)/);
            const origin = originMatch ? originMatch[1] : '';
            const sourceMatch = firstLine.match(/【題源】：([^\*]+)/);
            const source = sourceMatch ? sourceMatch[1].trim() : '';
            const questionLines = [];
            const answerSection = [];
            const solutionSection = [];
            let currentSection = 'question';
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const stripped = line.trim();
                if (stripped.startsWith('《答案》')) {
                    currentSection = 'answer';
                    answerSection.push(line);
                }
                else if (stripped.startsWith('《解析》')) {
                    currentSection = 'solution';
                    solutionSection.push(line);
                }
                else if (currentSection === 'question') {
                    if (stripped.startsWith('>')) {
                        questionLines.push(line.replace(/^>\s*/, '').trim());
                    }
                    else if (stripped && !stripped.startsWith('《')) {
                        questionLines.push(stripped);
                    }
                }
                else if (currentSection === 'answer') {
                    answerSection.push(line);
                }
                else if (currentSection === 'solution') {
                    solutionSection.push(line);
                }
            }
            const questionContent = questionLines.join('\n').trim();
            const answerText = answerSection.join('\n').trim();
            const answerMatch = answerText.match(/《答案》\s*([A-Z]|[A-Z,]+|\d+|[^\n《]+)/);
            const answerValue = answerMatch ? answerMatch[1].trim() : '';
            let solutionText = solutionSection.join('\n').trim();
            solutionText = solutionText.replace(/《解析》\s*\\?/, '').trim();
            let questionType = 'SINGLE_CHOICE';
            if (questionContent.includes('(A)') || questionContent.includes('（A）')) {
                if (answerValue.includes(',') || answerValue.length > 1) {
                    questionType = 'MULTIPLE_CHOICE';
                }
            }
            const options = [];
            const optionPattern = /[(\（]([A-Z])[)\）]\s*\$?([^(\（\n]+?)(?=\s*[(\（]|$)/g;
            let optionMatch;
            while ((optionMatch = optionPattern.exec(questionContent)) !== null) {
                const letter = optionMatch[1];
                let text = optionMatch[2].trim();
                text = text.replace(/\$$/, '').replace(/　/g, ' ').trim();
                options.push({ value: letter, label: text });
            }
            const correctAnswerContent = `**《答案》${answerValue}**`;
            const solutionContent = solutionText
                ? {
                    format: 'markdown',
                    text: solutionText,
                }
                : undefined;
            return {
                subject_id: subjectId,
                level,
                chapter,
                content: questionContent,
                correct_answer: correctAnswerContent,
                solution_content: solutionContent,
                difficulty,
                question_type: questionType,
                options,
                question_number: questionNumber,
                origin,
                origin_detail: source,
                source: source || origin,
            };
        }
        catch (error) {
            return null;
        }
    }
    replaceImagePaths(text, imageMapping) {
        return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, originalPath) => {
            if (originalPath in imageMapping) {
                return `![${altText}](${imageMapping[originalPath]})`;
            }
            if (`./media/${originalPath}` in imageMapping) {
                return `![${altText}](${imageMapping[`./media/${originalPath}`]})`;
            }
            return match;
        });
    }
};
exports.MarkdownImporterService = MarkdownImporterService;
exports.MarkdownImporterService = MarkdownImporterService = __decorate([
    (0, common_1.Injectable)()
], MarkdownImporterService);


/***/ }),

/***/ "./src/cramschool/services/order-items.service.ts":
/*!********************************************************!*\
  !*** ./src/cramschool/services/order-items.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrderItemsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let OrderItemsService = class OrderItemsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrderItems(orderId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (orderId) {
            where.orderId = orderId;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolOrderItem.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    order: true,
                },
                orderBy: { orderItemId: 'asc' },
            }),
            this.prisma.cramschoolOrderItem.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((oi) => this.toOrderItemDto(oi)), count, page, pageSize);
    }
    async getOrderItem(id) {
        const orderItem = await this.prisma.cramschoolOrderItem.findUnique({
            where: { orderItemId: id },
            include: {
                order: true,
            },
        });
        if (!orderItem) {
            throw new common_1.NotFoundException(`OrderItem with ID ${id} not found`);
        }
        return this.toOrderItemDto(orderItem);
    }
    async createOrderItem(createDto) {
        const orderItem = await this.prisma.cramschoolOrderItem.create({
            data: {
                orderId: createDto.order_id,
                itemName: createDto.item_name,
                quantity: createDto.quantity || 1,
                unitPrice: createDto.unit_price,
                subtotal: createDto.subtotal || createDto.unit_price * (createDto.quantity || 1),
            },
            include: {
                order: true,
            },
        });
        return this.toOrderItemDto(orderItem);
    }
    async updateOrderItem(id, updateDto) {
        const orderItem = await this.prisma.cramschoolOrderItem.findUnique({
            where: { orderItemId: id },
        });
        if (!orderItem) {
            throw new common_1.NotFoundException(`OrderItem with ID ${id} not found`);
        }
        const updatedOrderItem = await this.prisma.cramschoolOrderItem.update({
            where: { orderItemId: id },
            data: {
                orderId: updateDto.order_id,
                itemName: updateDto.item_name,
                quantity: updateDto.quantity,
                unitPrice: updateDto.unit_price,
                subtotal: updateDto.subtotal !== undefined ? updateDto.subtotal : undefined,
            },
            include: {
                order: true,
            },
        });
        return this.toOrderItemDto(updatedOrderItem);
    }
    async deleteOrderItem(id) {
        const orderItem = await this.prisma.cramschoolOrderItem.findUnique({
            where: { orderItemId: id },
        });
        if (!orderItem) {
            throw new common_1.NotFoundException(`OrderItem with ID ${id} not found`);
        }
        await this.prisma.cramschoolOrderItem.delete({
            where: { orderItemId: id },
        });
    }
    toOrderItemDto(orderItem) {
        return {
            order_item_id: orderItem.orderItemId,
            order_id: orderItem.orderId,
            item_name: orderItem.itemName,
            quantity: orderItem.quantity,
            unit_price: Number(orderItem.unitPrice),
            subtotal: Number(orderItem.subtotal),
        };
    }
};
exports.OrderItemsService = OrderItemsService;
exports.OrderItemsService = OrderItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], OrderItemsService);


/***/ }),

/***/ "./src/cramschool/services/orders.service.ts":
/*!***************************************************!*\
  !*** ./src/cramschool/services/orders.service.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrdersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrders(includeDeleted = false, groupOrderId, studentId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        if (groupOrderId) {
            where.groupOrderId = groupOrderId;
        }
        if (studentId) {
            where.studentId = studentId;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolOrder.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    groupOrder: {
                        include: {
                            restaurant: true,
                        },
                    },
                    student: true,
                    items: true,
                },
                orderBy: { orderId: 'desc' },
            }),
            this.prisma.cramschoolOrder.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((o) => this.toOrderDto(o)), count, page, pageSize);
    }
    async getOrder(id) {
        const order = await this.prisma.cramschoolOrder.findUnique({
            where: { orderId: id },
            include: {
                groupOrder: {
                    include: {
                        restaurant: true,
                    },
                },
                student: true,
                items: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return this.toOrderDto(order);
    }
    async createOrder(createDto) {
        const order = await this.prisma.cramschoolOrder.create({
            data: {
                groupOrderId: createDto.group_order_id,
                studentId: createDto.student_id,
                status: createDto.status || 'Pending',
                totalAmount: createDto.total_amount || 0,
                notes: createDto.notes || null,
            },
            include: {
                groupOrder: {
                    include: {
                        restaurant: true,
                    },
                },
                student: true,
                items: true,
            },
        });
        return this.toOrderDto(order);
    }
    async updateOrder(id, updateDto) {
        const order = await this.prisma.cramschoolOrder.findUnique({
            where: { orderId: id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const updatedOrder = await this.prisma.cramschoolOrder.update({
            where: { orderId: id },
            data: {
                groupOrderId: updateDto.group_order_id,
                studentId: updateDto.student_id,
                status: updateDto.status,
                totalAmount: updateDto.total_amount !== undefined ? updateDto.total_amount : undefined,
                notes: updateDto.notes !== undefined ? updateDto.notes : undefined,
            },
            include: {
                groupOrder: {
                    include: {
                        restaurant: true,
                    },
                },
                student: true,
                items: true,
            },
        });
        return this.toOrderDto(updatedOrder);
    }
    async deleteOrder(id) {
        const order = await this.prisma.cramschoolOrder.findUnique({
            where: { orderId: id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        await this.prisma.cramschoolOrder.update({
            where: { orderId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async restoreOrder(id) {
        const order = await this.prisma.cramschoolOrder.findUnique({
            where: { orderId: id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        if (!order.isDeleted) {
            throw new common_1.NotFoundException(`Order with ID ${id} is not deleted`);
        }
        const restoredOrder = await this.prisma.cramschoolOrder.update({
            where: { orderId: id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
            include: {
                groupOrder: {
                    include: {
                        restaurant: true,
                    },
                },
                student: true,
                items: true,
            },
        });
        return this.toOrderDto(restoredOrder);
    }
    toOrderDto(order) {
        return {
            order_id: order.orderId,
            group_order_id: order.groupOrderId,
            student_id: order.studentId,
            status: order.status,
            total_amount: Number(order.totalAmount),
            notes: order.notes || null,
            created_at: order.createdAt?.toISOString(),
            updated_at: order.updatedAt?.toISOString(),
            is_deleted: order.isDeleted,
            deleted_at: order.deletedAt?.toISOString() || null,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], OrdersService);


/***/ }),

/***/ "./src/cramschool/services/question-tags.service.ts":
/*!**********************************************************!*\
  !*** ./src/cramschool/services/question-tags.service.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionTagsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let QuestionTagsService = class QuestionTagsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getQuestionTags(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolQuestionTag.findMany({
                skip,
                take: pageSize,
                include: {
                    question: true,
                    tag: true,
                },
            }),
            this.prisma.cramschoolQuestionTag.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((qt) => this.toQuestionTagDto(qt)), count, page, pageSize);
    }
    async getQuestionTag(id) {
        const questionTag = await this.prisma.cramschoolQuestionTag.findUnique({
            where: { questionTagId: id },
            include: {
                question: true,
                tag: true,
            },
        });
        if (!questionTag) {
            throw new common_1.NotFoundException(`QuestionTag with ID ${id} not found`);
        }
        return this.toQuestionTagDto(questionTag);
    }
    async createQuestionTag(createDto) {
        const questionTag = await this.prisma.cramschoolQuestionTag.create({
            data: {
                questionId: createDto.question_id,
                tagId: createDto.tag_id,
            },
            include: {
                question: true,
                tag: true,
            },
        });
        return this.toQuestionTagDto(questionTag);
    }
    async updateQuestionTag(id, updateDto) {
        const questionTag = await this.prisma.cramschoolQuestionTag.findUnique({
            where: { questionTagId: id },
        });
        if (!questionTag) {
            throw new common_1.NotFoundException(`QuestionTag with ID ${id} not found`);
        }
        const updatedQuestionTag = await this.prisma.cramschoolQuestionTag.update({
            where: { questionTagId: id },
            data: {
                questionId: updateDto.question_id,
                tagId: updateDto.tag_id,
            },
            include: {
                question: true,
                tag: true,
            },
        });
        return this.toQuestionTagDto(updatedQuestionTag);
    }
    async deleteQuestionTag(id) {
        const questionTag = await this.prisma.cramschoolQuestionTag.findUnique({
            where: { questionTagId: id },
        });
        if (!questionTag) {
            throw new common_1.NotFoundException(`QuestionTag with ID ${id} not found`);
        }
        await this.prisma.cramschoolQuestionTag.delete({
            where: { questionTagId: id },
        });
    }
    toQuestionTagDto(questionTag) {
        return {
            question_tag_id: questionTag.questionTagId,
            question_id: questionTag.questionId,
            tag_id: questionTag.tagId,
        };
    }
};
exports.QuestionTagsService = QuestionTagsService;
exports.QuestionTagsService = QuestionTagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], QuestionTagsService);


/***/ }),

/***/ "./src/cramschool/services/questions/questions-export.service.ts":
/*!***********************************************************************!*\
  !*** ./src/cramschool/services/questions/questions-export.service.ts ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionsExportService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
let QuestionsExportService = class QuestionsExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportToLatex(id) {
        const question = await this.prisma.cramschoolQuestionBank.findUnique({
            where: { questionId: id },
            include: {
                subject: true,
                tags: true,
            },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID ${id} not found`);
        }
        let latex = '\\documentclass{article}\n';
        latex += '\\usepackage{amsmath}\n';
        latex += '\\usepackage{amssymb}\n';
        latex += '\\begin{document}\n\n';
        latex += `\\section*{題目 ${question.questionId}}\n\n`;
        if (question.subject) {
            latex += `\\textbf{科目:} ${question.subject.name}\\\\\n`;
        }
        if (question.chapter) {
            latex += `\\textbf{章節:} ${question.chapter}\\\\\n`;
        }
        if (question.level) {
            latex += `\\textbf{年級:} ${question.level}\\\\\n`;
        }
        latex += '\n';
        latex += '\\textbf{題目:}\\\\\n';
        const contentText = typeof question.content === 'object' && question.content !== null
            ? JSON.stringify(question.content)
            : String(question.content);
        latex += this.convertToLatex(contentText) + '\n\n';
        if (question.questionType === 'SINGLE_CHOICE' && question.options) {
            latex += '\\textbf{選項:}\\\\\n';
            latex += '\\begin{enumerate}\n';
            const options = typeof question.options === 'object' ? question.options : JSON.parse(String(question.options));
            if (Array.isArray(options)) {
                options.forEach((option) => {
                    const optionText = typeof option === 'object' ? (option.text || option.label || '') : String(option);
                    latex += `  \\item ${this.convertToLatex(optionText)}\n`;
                });
            }
            latex += '\\end{enumerate}\n\n';
        }
        if (question.correctAnswer) {
            latex += '\\textbf{答案:}\\\\\n';
            const answerText = typeof question.correctAnswer === 'object'
                ? JSON.stringify(question.correctAnswer)
                : String(question.correctAnswer);
            latex += this.convertToLatex(answerText) + '\n\n';
        }
        if (question.solutionContent) {
            latex += '\\textbf{解析:}\\\\\n';
            const solutionText = typeof question.solutionContent === 'object'
                ? JSON.stringify(question.solutionContent)
                : String(question.solutionContent);
            latex += this.convertToLatex(solutionText) + '\n\n';
        }
        latex += '\\end{document}\n';
        return {
            latex,
            filename: `question_${id}.tex`,
        };
    }
    async exportToMarkdown(id) {
        const question = await this.prisma.cramschoolQuestionBank.findUnique({
            where: { questionId: id },
            include: {
                subject: true,
                tags: true,
            },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID ${id} not found`);
        }
        let markdown = `# 題目 ${question.questionId}\n\n`;
        markdown += '## 基本資訊\n\n';
        if (question.subject) {
            markdown += `- **科目:** ${question.subject.name}\n`;
        }
        if (question.chapter) {
            markdown += `- **章節:** ${question.chapter}\n`;
        }
        if (question.level) {
            markdown += `- **年級:** ${question.level}\n`;
        }
        if (question.difficulty) {
            markdown += `- **難度:** ${question.difficulty}\n`;
        }
        markdown += '\n';
        markdown += '## 題目\n\n';
        const contentText = typeof question.content === 'object' && question.content !== null
            ? JSON.stringify(question.content)
            : String(question.content);
        markdown += contentText + '\n\n';
        if (question.questionType === 'SINGLE_CHOICE' && question.options) {
            markdown += '## 選項\n\n';
            const options = typeof question.options === 'object' ? question.options : JSON.parse(String(question.options));
            if (Array.isArray(options)) {
                options.forEach((option, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const optionText = typeof option === 'object' ? (option.text || option.label || '') : String(option);
                    markdown += `${letter}. ${optionText}\n`;
                });
            }
            markdown += '\n';
        }
        if (question.correctAnswer) {
            markdown += '## 答案\n\n';
            const answerText = typeof question.correctAnswer === 'object'
                ? JSON.stringify(question.correctAnswer)
                : String(question.correctAnswer);
            markdown += answerText + '\n\n';
        }
        if (question.solutionContent) {
            markdown += '## 解析\n\n';
            const solutionText = typeof question.solutionContent === 'object'
                ? JSON.stringify(question.solutionContent)
                : String(question.solutionContent);
            markdown += solutionText + '\n\n';
        }
        return {
            markdown,
            filename: `question_${id}.md`,
        };
    }
    convertToLatex(content) {
        let latex = content;
        latex = latex.replace(/<[^>]*>/g, '');
        return latex;
    }
};
exports.QuestionsExportService = QuestionsExportService;
exports.QuestionsExportService = QuestionsExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], QuestionsExportService);


/***/ }),

/***/ "./src/cramschool/services/questions/questions-import.service.ts":
/*!***********************************************************************!*\
  !*** ./src/cramschool/services/questions/questions-import.service.ts ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionsImportService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
const word_importer_service_1 = __webpack_require__(/*! ../word-importer.service */ "./src/cramschool/services/word-importer.service.ts");
const markdown_importer_service_1 = __webpack_require__(/*! ../markdown-importer.service */ "./src/cramschool/services/markdown-importer.service.ts");
let QuestionsImportService = class QuestionsImportService {
    constructor(prisma, wordImporter, markdownImporter) {
        this.prisma = prisma;
        this.wordImporter = wordImporter;
        this.markdownImporter = markdownImporter;
    }
    async previewFromWord(file, subjectId, level, chapter) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const result = await this.wordImporter.importQuestions(file.buffer, file.originalname, subjectId, level || '', chapter || '');
        return {
            success: true,
            count: result.questions.length,
            questions: result.questions,
            errors: result.errors,
        };
    }
    async importFromWord(file, subjectId, level, chapter, _userId, _userRole, _difficulty) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const result = await this.wordImporter.importQuestions(file.buffer, file.originalname, subjectId, level || '', chapter || '');
        const questions = result.questions;
        const createdQuestions = [];
        for (const q of questions) {
            const question = await this.prisma.cramschoolQuestionBank.create({
                data: {
                    subjectId,
                    level: level || '',
                    chapter: chapter || q.origin_detail || '',
                    content: { text: q.content },
                    correctAnswer: q.answer || '',
                    solutionContent: q.explanation ? { text: q.explanation } : client_1.Prisma.DbNull,
                    difficulty: q.difficulty || 3,
                    questionType: 'SINGLE_CHOICE',
                    options: q.options || [],
                    questionNumber: q.question_number || '',
                    origin: q.origin || '',
                    originDetail: q.origin_detail || '',
                    source: 'word_import',
                },
            });
            createdQuestions.push(question);
        }
        return {
            success: true,
            count: createdQuestions.length,
            questions: createdQuestions.map((q) => ({
                question_id: q.questionId,
                content: q.content,
            })),
        };
    }
    async previewFromMarkdown(markdownFile, images, subjectId, level, chapter) {
        const content = markdownFile.buffer.toString('utf-8');
        if (!content || content.trim().length === 0) {
            throw new common_1.BadRequestException('No content provided');
        }
        const imagesDict = {};
        images.forEach((img) => {
            imagesDict[img.originalname] = img.buffer;
        });
        const result = await this.markdownImporter.importQuestions(content, imagesDict, subjectId, level || '', chapter || '');
        return {
            success: true,
            count: result.questions.length,
            questions: result.questions,
            errors: result.errors,
        };
    }
    async importFromMarkdown(markdownFile, images, subjectId, level, chapter, _userId, _userRole) {
        const content = markdownFile.buffer.toString('utf-8');
        if (!content || content.trim().length === 0) {
            throw new common_1.BadRequestException('No content provided');
        }
        const imagesDict = {};
        images.forEach((img) => {
            imagesDict[img.originalname] = img.buffer;
        });
        const result = await this.markdownImporter.importQuestions(content, imagesDict, subjectId, level || '', chapter || '');
        const questions = result.questions;
        const createdQuestions = [];
        for (const q of questions) {
            const question = await this.prisma.cramschoolQuestionBank.create({
                data: {
                    subjectId: q.subject_id,
                    level: q.level,
                    chapter: q.chapter,
                    content: { text: q.content },
                    correctAnswer: q.correct_answer,
                    solutionContent: q.solution_content,
                    difficulty: q.difficulty,
                    questionType: q.question_type,
                    options: q.options,
                    questionNumber: q.question_number,
                    origin: q.origin,
                    originDetail: q.origin_detail,
                    source: q.source,
                },
            });
            createdQuestions.push(question);
        }
        return {
            success: true,
            count: createdQuestions.length,
            questions: createdQuestions.map((q) => ({
                question_id: q.questionId,
                content: q.content,
            })),
        };
    }
};
exports.QuestionsImportService = QuestionsImportService;
exports.QuestionsImportService = QuestionsImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof word_importer_service_1.WordImporterService !== "undefined" && word_importer_service_1.WordImporterService) === "function" ? _b : Object, typeof (_c = typeof markdown_importer_service_1.MarkdownImporterService !== "undefined" && markdown_importer_service_1.MarkdownImporterService) === "function" ? _c : Object])
], QuestionsImportService);


/***/ }),

/***/ "./src/cramschool/services/questions/questions-permission.service.ts":
/*!***************************************************************************!*\
  !*** ./src/cramschool/services/questions/questions-permission.service.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionsPermissionService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let QuestionsPermissionService = class QuestionsPermissionService {
    checkCreatePermission(userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以創建題目');
        }
    }
    checkUpdatePermission(userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以更新題目');
        }
    }
    checkDeletePermission(userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以刪除題目');
        }
    }
    checkListPermission(userRole) {
        if (userRole === 'STUDENT') {
            throw new common_1.ForbiddenException('學生不能查看題目列表');
        }
    }
};
exports.QuestionsPermissionService = QuestionsPermissionService;
exports.QuestionsPermissionService = QuestionsPermissionService = __decorate([
    (0, common_1.Injectable)()
], QuestionsPermissionService);


/***/ }),

/***/ "./src/cramschool/services/questions/questions-query.service.ts":
/*!**********************************************************************!*\
  !*** ./src/cramschool/services/questions/questions-query.service.ts ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionsQueryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
const questions_permission_service_1 = __webpack_require__(/*! ./questions-permission.service */ "./src/cramschool/services/questions/questions-permission.service.ts");
let QuestionsQueryService = class QuestionsQueryService {
    constructor(prisma, permissionService) {
        this.prisma = prisma;
        this.permissionService = permissionService;
    }
    async getQuestions(query, userId, userRole) {
        this.permissionService.checkListPermission(userRole);
        if (userRole === 'ADMIN' || userRole === 'ACCOUNTANT') {
            return (0, pagination_util_1.createPaginatedResponse)([], 0, query.page || 1, query.page_size || 10);
        }
        const page = query.page || 1;
        const pageSize = query.page_size || 10;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (query.subject) {
            where.subjectId = query.subject;
        }
        if (query.level) {
            where.level = query.level;
        }
        if (query.chapter) {
            where.chapter = { contains: query.chapter, mode: 'insensitive' };
        }
        if (query.difficulty) {
            where.difficulty = query.difficulty;
        }
        if (query.question_type) {
            where.questionType = query.question_type;
        }
        if (query.tags && query.tags.length > 0) {
            const questionsWithTags = await this.prisma.cramschoolQuestionTag.findMany({
                where: { tagId: { in: query.tags } },
                select: { questionId: true },
                distinct: ['questionId'],
            });
            const questionIds = questionsWithTags.map((q) => q.questionId);
            where.questionId = { in: questionIds };
        }
        if (query.source) {
            where.source = query.source;
        }
        if (query.search) {
            where.searchTextContent = { contains: query.search, mode: 'insensitive' };
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolQuestionBank.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    subject: true,
                    createdBy: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: [{ createdAt: 'desc' }, { questionId: 'desc' }],
            }),
            this.prisma.cramschoolQuestionBank.count({ where }),
        ]);
        return {
            results,
            count,
            page,
            pageSize,
        };
    }
    async searchChapters(query, subjectId, level) {
        if (!query || !query.trim()) {
            return [];
        }
        const where = {
            chapter: { contains: query.trim(), mode: 'insensitive' },
        };
        if (subjectId) {
            where.subjectId = subjectId;
        }
        if (level) {
            where.level = level;
        }
        const questions = await this.prisma.cramschoolQuestionBank.findMany({
            where,
            select: { chapter: true },
        });
        const chapterMap = new Map();
        for (const q of questions) {
            if (q.chapter) {
                chapterMap.set(q.chapter, (chapterMap.get(q.chapter) || 0) + 1);
            }
        }
        const chapters = Array.from(chapterMap.entries()).map(([chapter, count]) => {
            const relevance = chapter.toLowerCase().startsWith(query.toLowerCase().trim()) ? 2 : 1;
            return {
                chapter,
                count,
                relevance,
            };
        });
        chapters.sort((a, b) => {
            if (b.relevance !== a.relevance) {
                return b.relevance - a.relevance;
            }
            return b.count - a.count;
        });
        return chapters.slice(0, 10);
    }
};
exports.QuestionsQueryService = QuestionsQueryService;
exports.QuestionsQueryService = QuestionsQueryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof questions_permission_service_1.QuestionsPermissionService !== "undefined" && questions_permission_service_1.QuestionsPermissionService) === "function" ? _b : Object])
], QuestionsQueryService);


/***/ }),

/***/ "./src/cramschool/services/questions/questions.service.ts":
/*!****************************************************************!*\
  !*** ./src/cramschool/services/questions/questions.service.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const questions_permission_service_1 = __webpack_require__(/*! ./questions-permission.service */ "./src/cramschool/services/questions/questions-permission.service.ts");
const questions_query_service_1 = __webpack_require__(/*! ./questions-query.service */ "./src/cramschool/services/questions/questions-query.service.ts");
const questions_export_service_1 = __webpack_require__(/*! ./questions-export.service */ "./src/cramschool/services/questions/questions-export.service.ts");
const questions_import_service_1 = __webpack_require__(/*! ./questions-import.service */ "./src/cramschool/services/questions/questions-import.service.ts");
let QuestionsService = class QuestionsService {
    constructor(prisma, permissionService, queryService, exportService, importService) {
        this.prisma = prisma;
        this.permissionService = permissionService;
        this.queryService = queryService;
        this.exportService = exportService;
        this.importService = importService;
    }
    toQuestionDto(question) {
        return {
            question_id: question.questionId,
            subject_id: question.subjectId,
            level: question.level,
            chapter: question.chapter,
            content: question.content,
            image_path: question.imagePath,
            correct_answer: question.correctAnswer,
            difficulty: question.difficulty,
            question_type: question.questionType,
            options: question.options,
            metadata: question.metadata,
            question_number: question.questionNumber,
            origin: question.origin,
            origin_detail: question.originDetail,
            source: question.source || '九章自命題',
            created_by: question.createdById,
            imported_from_error_log: question.importedFromErrorLogId,
            imported_student: question.importedStudentId,
            solution_content: question.solutionContent,
            search_text_content: question.searchTextContent,
            created_at: question.createdAt.toISOString(),
            updated_at: question.updatedAt.toISOString(),
            tags: question.tags?.map((t) => t.tag.tagId) || [],
            tag_names: question.tags?.map((t) => t.tag.tagName) || [],
        };
    }
    extractTextFromTiptap(content) {
        if (!content || typeof content !== 'object') {
            return '';
        }
        const textParts = [];
        if (content.type === 'text' && content.text) {
            textParts.push(content.text);
        }
        if (content.content && Array.isArray(content.content)) {
            for (const child of content.content) {
                textParts.push(this.extractTextFromTiptap(child));
            }
        }
        return textParts.join(' ');
    }
    async getQuestions(query, userId, userRole) {
        const result = await this.queryService.getQuestions(query, userId, userRole);
        return {
            ...result,
            results: result.results.map((q) => this.toQuestionDto(q)),
        };
    }
    async getQuestion(id) {
        const question = await this.prisma.cramschoolQuestionBank.findUnique({
            where: { questionId: id },
            include: {
                subject: true,
                createdBy: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID ${id} not found`);
        }
        return this.toQuestionDto(question);
    }
    async createQuestion(createDto, userId, userRole) {
        this.permissionService.checkCreatePermission(userRole);
        const question = await this.prisma.cramschoolQuestionBank.create({
            data: {
                subjectId: createDto.subject_id,
                level: createDto.level,
                chapter: createDto.chapter,
                content: createDto.content,
                imagePath: createDto.image_path,
                correctAnswer: createDto.correct_answer,
                difficulty: createDto.difficulty || 1,
                questionType: createDto.question_type || 'SINGLE_CHOICE',
                options: createDto.options,
                metadata: createDto.metadata,
                questionNumber: createDto.question_number,
                origin: createDto.origin,
                originDetail: createDto.origin_detail,
                source: createDto.source || '九章自命題',
                createdById: userId,
                importedFromErrorLogId: createDto.imported_from_error_log,
                importedStudentId: createDto.imported_student,
                solutionContent: createDto.solution_content,
                searchTextContent: this.extractTextFromTiptap(createDto.content),
            },
        });
        return this.getQuestion(question.questionId);
    }
    async updateQuestion(id, updateDto, _userId, userRole) {
        this.permissionService.checkUpdatePermission(userRole);
        const question = await this.prisma.cramschoolQuestionBank.findUnique({
            where: { questionId: id },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID ${id} not found`);
        }
        let searchTextContent = question.searchTextContent;
        if (updateDto.content) {
            searchTextContent = this.extractTextFromTiptap(updateDto.content);
        }
        await this.prisma.cramschoolQuestionBank.update({
            where: { questionId: id },
            data: {
                subjectId: updateDto.subject_id,
                level: updateDto.level,
                chapter: updateDto.chapter,
                content: updateDto.content,
                imagePath: updateDto.image_path,
                correctAnswer: updateDto.correct_answer,
                difficulty: updateDto.difficulty,
                questionType: updateDto.question_type,
                options: updateDto.options,
                metadata: updateDto.metadata,
                questionNumber: updateDto.question_number,
                origin: updateDto.origin,
                originDetail: updateDto.origin_detail,
                source: updateDto.source,
                solutionContent: updateDto.solution_content,
                searchTextContent,
            },
        });
        return this.getQuestion(id);
    }
    async deleteQuestion(id, userRole) {
        this.permissionService.checkDeletePermission(userRole);
        const question = await this.prisma.cramschoolQuestionBank.findUnique({
            where: { questionId: id },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID ${id} not found`);
        }
        await this.prisma.cramschoolQuestionBank.delete({
            where: { questionId: id },
        });
    }
    async searchChapters(query, subjectId, level) {
        return this.queryService.searchChapters(query, subjectId, level);
    }
    async getSourceOptions() {
        const options = [
            '九章自命題',
            '參考書',
            '歷屆試題',
            '網路資源',
            '其他',
        ];
        return {
            options,
            default: '九章自命題',
        };
    }
    async exportToLatex(id) {
        return this.exportService.exportToLatex(id);
    }
    async exportToMarkdown(id) {
        return this.exportService.exportToMarkdown(id);
    }
    async previewFromWord(file, subjectId, level, chapter) {
        return this.importService.previewFromWord(file, subjectId, level, chapter);
    }
    async importFromWord(file, subjectId, level, chapter, userId) {
        return this.importService.importFromWord(file, subjectId, level, chapter, userId);
    }
    async previewFromMarkdown(markdownFile, images, subjectId, level, chapter) {
        return this.importService.previewFromMarkdown(markdownFile, images, subjectId, level, chapter);
    }
    async importFromMarkdown(markdownFile, images, subjectId, level, chapter, userId) {
        return this.importService.importFromMarkdown(markdownFile, images, subjectId, level, chapter, userId);
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof questions_permission_service_1.QuestionsPermissionService !== "undefined" && questions_permission_service_1.QuestionsPermissionService) === "function" ? _b : Object, typeof (_c = typeof questions_query_service_1.QuestionsQueryService !== "undefined" && questions_query_service_1.QuestionsQueryService) === "function" ? _c : Object, typeof (_d = typeof questions_export_service_1.QuestionsExportService !== "undefined" && questions_export_service_1.QuestionsExportService) === "function" ? _d : Object, typeof (_e = typeof questions_import_service_1.QuestionsImportService !== "undefined" && questions_import_service_1.QuestionsImportService) === "function" ? _e : Object])
], QuestionsService);


/***/ }),

/***/ "./src/cramschool/services/resources.service.ts":
/*!******************************************************!*\
  !*** ./src/cramschool/services/resources.service.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourcesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let ResourcesService = class ResourcesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getResources(userId, userRole, page = 1, pageSize = 10, courseId, mode) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (userRole === 'ADMIN') {
            if (courseId) {
                const resourcesInCourse = await this.prisma.cramschoolLearningResourceCourse.findMany({
                    where: { courseId },
                    select: { resourceId: true },
                });
                where.resourceId = { in: resourcesInCourse.map((r) => r.resourceId) };
            }
            if (mode) {
                where.mode = mode;
            }
        }
        else if (userRole === 'TEACHER') {
            const teacher = await this.prisma.cramschoolTeacher.findFirst({
                where: { userId },
            });
            if (!teacher) {
                return (0, pagination_util_1.createPaginatedResponse)([], 0, page, pageSize);
            }
            const teacherCourses = await this.prisma.cramschoolCourse.findMany({
                where: { teacherId: teacher.teacherId },
                select: { courseId: true },
            });
            const teacherCourseIds = teacherCourses.map((c) => c.courseId);
            const resourcesInCourses = await this.prisma.cramschoolLearningResourceCourse.findMany({
                where: { courseId: { in: teacherCourseIds } },
                select: { resourceId: true },
                distinct: ['resourceId'],
            });
            const resourceIds = resourcesInCourses.map((r) => r.resourceId);
            where.resourceId = { in: resourceIds };
            if (mode) {
                where.mode = mode;
            }
        }
        else if (userRole === 'STUDENT') {
            const student = await this.prisma.cramschoolStudent.findFirst({
                where: { userId },
            });
            if (!student) {
                return (0, pagination_util_1.createPaginatedResponse)([], 0, page, pageSize);
            }
            const now = new Date();
            where.OR = [
                { availableFrom: { lte: now } },
                { availableFrom: null },
            ];
            where.AND = [
                {
                    OR: [
                        { availableUntil: { gte: now } },
                        { availableUntil: null },
                    ],
                },
            ];
            const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
                where: {
                    studentId: student.studentId,
                    isActive: true,
                    isDeleted: false,
                },
                select: { courseId: true },
            });
            const enrolledCourseIds = enrollments.map((e) => e.courseId);
            const studentGroups = await this.prisma.cramschoolStudentGroupStudent.findMany({
                where: { studentId: student.studentId },
                select: { groupId: true },
            });
            const studentGroupIds = studentGroups.map((g) => g.groupId);
            const [resourcesInCourses, resourcesInGroups] = await Promise.all([
                this.prisma.cramschoolLearningResourceCourse.findMany({
                    where: { courseId: { in: enrolledCourseIds } },
                    select: { resourceId: true },
                    distinct: ['resourceId'],
                }),
                this.prisma.cramschoolLearningResourceStudentGroup.findMany({
                    where: { groupId: { in: studentGroupIds } },
                    select: { resourceId: true },
                    distinct: ['resourceId'],
                }),
            ]);
            const resourceIds = [
                ...resourcesInCourses.map((r) => r.resourceId),
                ...resourcesInGroups.map((r) => r.resourceId),
            ];
            where.resourceId = { in: resourceIds };
            if (mode) {
                where.mode = mode;
            }
        }
        else {
            return (0, pagination_util_1.createPaginatedResponse)([], 0, page, pageSize);
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolLearningResource.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    courses: {
                        include: {
                            course: true,
                        },
                    },
                    studentGroups: {
                        include: {
                            group: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.cramschoolLearningResource.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((r) => this.toResourceDto(r)), count, page, pageSize);
    }
    async getResource(id) {
        const resource = await this.prisma.cramschoolLearningResource.findUnique({
            where: { resourceId: id },
            include: {
                courses: {
                    include: {
                        course: true,
                    },
                },
                studentGroups: {
                    include: {
                        group: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        if (!resource) {
            throw new common_1.NotFoundException(`Resource with ID ${id} not found`);
        }
        return this.toResourceDto(resource);
    }
    async createResource(createDto, userId, userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以創建教學資源');
        }
        if (createDto.course_ids && createDto.course_ids.length > 0) {
            const teacher = await this.prisma.cramschoolTeacher.findFirst({
                where: { userId },
            });
            if (teacher) {
                const teacherCourses = await this.prisma.cramschoolCourse.findMany({
                    where: { teacherId: teacher.teacherId },
                    select: { courseId: true },
                });
                const teacherCourseIds = teacherCourses.map((c) => c.courseId);
                const invalidCourses = createDto.course_ids.filter((cid) => !teacherCourseIds.includes(cid));
                if (invalidCourses.length > 0) {
                    throw new common_1.ForbiddenException(`只能在自己課程下創建資源，無效的課程ID: ${invalidCourses.join(', ')}`);
                }
            }
        }
        const resource = await this.prisma.cramschoolLearningResource.create({
            data: {
                title: createDto.title,
                mode: createDto.mode || 'HANDOUT',
                structure: (createDto.structure || []),
                tiptapStructure: (createDto.tiptap_structure || null),
                settings: (createDto.settings || {}),
                createdById: userId,
                isIndividualized: createDto.is_individualized || false,
                availableFrom: createDto.available_from ? new Date(createDto.available_from) : null,
                availableUntil: createDto.available_until ? new Date(createDto.available_until) : null,
            },
        });
        if (createDto.course_ids && createDto.course_ids.length > 0) {
            await Promise.all(createDto.course_ids.map((courseId) => this.prisma.cramschoolLearningResourceCourse.create({
                data: {
                    resourceId: resource.resourceId,
                    courseId,
                },
            })));
        }
        if (createDto.student_group_ids && createDto.student_group_ids.length > 0) {
            await Promise.all(createDto.student_group_ids.map((groupId) => this.prisma.cramschoolLearningResourceStudentGroup.create({
                data: {
                    resourceId: resource.resourceId,
                    groupId,
                },
            })));
        }
        if (createDto.tag_ids && createDto.tag_ids.length > 0) {
            await Promise.all(createDto.tag_ids.map((tagId) => this.prisma.cramschoolLearningResourceTag.create({
                data: {
                    resourceId: resource.resourceId,
                    tagId,
                },
            })));
        }
        return this.getResource(resource.resourceId);
    }
    async updateResource(id, updateDto, _userId, userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以更新教學資源');
        }
        const resource = await this.prisma.cramschoolLearningResource.findUnique({
            where: { resourceId: id },
        });
        if (!resource) {
            throw new common_1.NotFoundException(`Resource with ID ${id} not found`);
        }
        await this.prisma.cramschoolLearningResource.update({
            where: { resourceId: id },
            data: {
                title: updateDto.title,
                mode: updateDto.mode,
                structure: updateDto.structure,
                tiptapStructure: updateDto.tiptap_structure,
                settings: updateDto.settings,
                isIndividualized: updateDto.is_individualized,
                availableFrom: updateDto.available_from ? new Date(updateDto.available_from) : undefined,
                availableUntil: updateDto.available_until ? new Date(updateDto.available_until) : undefined,
            },
        });
        if (updateDto.course_ids !== undefined) {
            await this.prisma.cramschoolLearningResourceCourse.deleteMany({
                where: { resourceId: id },
            });
            if (updateDto.course_ids.length > 0) {
                await Promise.all(updateDto.course_ids.map((courseId) => this.prisma.cramschoolLearningResourceCourse.create({
                    data: {
                        resourceId: id,
                        courseId,
                    },
                })));
            }
        }
        if (updateDto.student_group_ids !== undefined) {
            await this.prisma.cramschoolLearningResourceStudentGroup.deleteMany({
                where: { resourceId: id },
            });
            if (updateDto.student_group_ids.length > 0) {
                await Promise.all(updateDto.student_group_ids.map((groupId) => this.prisma.cramschoolLearningResourceStudentGroup.create({
                    data: {
                        resourceId: id,
                        groupId,
                    },
                })));
            }
        }
        if (updateDto.tag_ids !== undefined) {
            await this.prisma.cramschoolLearningResourceTag.deleteMany({
                where: { resourceId: id },
            });
            if (updateDto.tag_ids.length > 0) {
                await Promise.all(updateDto.tag_ids.map((tagId) => this.prisma.cramschoolLearningResourceTag.create({
                    data: {
                        resourceId: id,
                        tagId,
                    },
                })));
            }
        }
        return this.getResource(id);
    }
    async deleteResource(id, userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以刪除教學資源');
        }
        const resource = await this.prisma.cramschoolLearningResource.findUnique({
            where: { resourceId: id },
        });
        if (!resource) {
            throw new common_1.NotFoundException(`Resource with ID ${id} not found`);
        }
        await this.prisma.cramschoolLearningResource.delete({
            where: { resourceId: id },
        });
    }
    async bindToCourse(id, courseId, action, userId, userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以綁定教學資源到課程');
        }
        const resource = await this.prisma.cramschoolLearningResource.findUnique({
            where: { resourceId: id },
        });
        if (!resource) {
            throw new common_1.NotFoundException(`Resource with ID ${id} not found`);
        }
        const course = await this.prisma.cramschoolCourse.findUnique({
            where: { courseId },
            include: {
                teacher: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${courseId} not found`);
        }
        const teacher = await this.prisma.cramschoolTeacher.findFirst({
            where: { userId },
        });
        if (!teacher || course.teacherId !== teacher.teacherId) {
            throw new common_1.ForbiddenException('只能在自己的課程下綁定資源');
        }
        if (action === 'add') {
            const existing = await this.prisma.cramschoolLearningResourceCourse.findUnique({
                where: {
                    resourceId_courseId: {
                        resourceId: id,
                        courseId,
                    },
                },
            });
            if (!existing) {
                await this.prisma.cramschoolLearningResourceCourse.create({
                    data: {
                        resourceId: id,
                        courseId,
                    },
                });
            }
            return { message: `已將資源綁定到課程 ${course.courseName}` };
        }
        else if (action === 'remove') {
            await this.prisma.cramschoolLearningResourceCourse.deleteMany({
                where: {
                    resourceId: id,
                    courseId,
                },
            });
            return { message: `已從課程 ${course.courseName} 解除綁定` };
        }
        else {
            throw new common_1.ForbiddenException('action 必須是 "add" 或 "remove"');
        }
    }
    async exportResource(id, formatType = 'question_only') {
        const resource = await this.prisma.cramschoolLearningResource.findUnique({
            where: { resourceId: id },
        });
        if (!resource) {
            throw new common_1.NotFoundException(`Resource with ID ${id} not found`);
        }
        return {
            resource_id: resource.resourceId,
            mode: resource.mode,
            format_type: formatType,
            message: '匯出功能需要遷移 resource_modes 目錄後才能完整實現',
        };
    }
    async gradeResource(id, _submission) {
        const resource = await this.prisma.cramschoolLearningResource.findUnique({
            where: { resourceId: id },
        });
        if (!resource) {
            throw new common_1.NotFoundException(`Resource with ID ${id} not found`);
        }
        return {
            resource_id: resource.resourceId,
            mode: resource.mode,
            message: '評分功能需要遷移 resource_modes 目錄後才能完整實現',
        };
    }
    toResourceDto(resource) {
        return {
            resource_id: resource.resourceId,
            title: resource.title,
            mode: resource.mode,
            course_ids: resource.courses?.map((c) => c.course.courseId) || [],
            student_group_ids: resource.studentGroups?.map((g) => g.group.groupId) || [],
            structure: resource.structure,
            tiptap_structure: resource.tiptapStructure,
            settings: resource.settings,
            tag_ids: resource.tags?.map((t) => t.tag.tagId) || [],
            created_by: resource.createdById,
            is_individualized: resource.isIndividualized,
            available_from: resource.availableFrom?.toISOString() || null,
            available_until: resource.availableUntil?.toISOString() || null,
            created_at: resource.createdAt.toISOString(),
            updated_at: resource.updatedAt.toISOString(),
        };
    }
};
exports.ResourcesService = ResourcesService;
exports.ResourcesService = ResourcesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ResourcesService);


/***/ }),

/***/ "./src/cramschool/services/restaurants.service.ts":
/*!********************************************************!*\
  !*** ./src/cramschool/services/restaurants.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RestaurantsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let RestaurantsService = class RestaurantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRestaurants(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolRestaurant.findMany({
                skip,
                take: pageSize,
                orderBy: { name: 'asc' },
            }),
            this.prisma.cramschoolRestaurant.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((r) => this.toRestaurantDto(r)), count, page, pageSize);
    }
    async getRestaurant(id) {
        const restaurant = await this.prisma.cramschoolRestaurant.findUnique({
            where: { restaurantId: id },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurant with ID ${id} not found`);
        }
        return this.toRestaurantDto(restaurant);
    }
    async createRestaurant(createDto) {
        const restaurant = await this.prisma.cramschoolRestaurant.create({
            data: {
                name: createDto.name,
                phone: createDto.phone || null,
                address: createDto.address || null,
                menuImagePath: createDto.menu_image_path || null,
                isActive: createDto.is_active !== undefined ? createDto.is_active : true,
            },
        });
        return this.toRestaurantDto(restaurant);
    }
    async updateRestaurant(id, updateDto) {
        const restaurant = await this.prisma.cramschoolRestaurant.findUnique({
            where: { restaurantId: id },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurant with ID ${id} not found`);
        }
        const updatedRestaurant = await this.prisma.cramschoolRestaurant.update({
            where: { restaurantId: id },
            data: {
                name: updateDto.name,
                phone: updateDto.phone !== undefined ? updateDto.phone : undefined,
                address: updateDto.address !== undefined ? updateDto.address : undefined,
                menuImagePath: updateDto.menu_image_path !== undefined ? updateDto.menu_image_path : undefined,
                isActive: updateDto.is_active !== undefined ? updateDto.is_active : undefined,
            },
        });
        return this.toRestaurantDto(updatedRestaurant);
    }
    async deleteRestaurant(id) {
        const restaurant = await this.prisma.cramschoolRestaurant.findUnique({
            where: { restaurantId: id },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurant with ID ${id} not found`);
        }
        await this.prisma.cramschoolRestaurant.delete({
            where: { restaurantId: id },
        });
    }
    toRestaurantDto(restaurant) {
        return {
            restaurant_id: restaurant.restaurantId,
            name: restaurant.name,
            phone: restaurant.phone || null,
            address: restaurant.address || null,
            menu_image_path: restaurant.menuImagePath || null,
            is_active: restaurant.isActive,
            created_at: restaurant.createdAt?.toISOString(),
            updated_at: restaurant.updatedAt?.toISOString(),
        };
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], RestaurantsService);


/***/ }),

/***/ "./src/cramschool/services/sessions.service.ts":
/*!*****************************************************!*\
  !*** ./src/cramschool/services/sessions.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let SessionsService = class SessionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSessions(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolSessionRecord.findMany({
                skip,
                take: pageSize,
                include: {
                    course: true,
                },
                orderBy: { sessionDate: 'desc' },
            }),
            this.prisma.cramschoolSessionRecord.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((s) => this.toSessionDto(s)), count, page, pageSize);
    }
    async getSession(id) {
        const session = await this.prisma.cramschoolSessionRecord.findUnique({
            where: { sessionId: id },
            include: {
                course: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        return this.toSessionDto(session);
    }
    async createSession(createDto) {
        const session = await this.prisma.cramschoolSessionRecord.create({
            data: {
                courseId: createDto.course_id,
                sessionDate: new Date(createDto.session_date),
            },
            include: {
                course: true,
            },
        });
        return this.toSessionDto(session);
    }
    async updateSession(id, updateDto) {
        const session = await this.prisma.cramschoolSessionRecord.findUnique({
            where: { sessionId: id },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        const updatedSession = await this.prisma.cramschoolSessionRecord.update({
            where: { sessionId: id },
            data: {
                courseId: updateDto.course_id,
                sessionDate: updateDto.session_date ? new Date(updateDto.session_date) : undefined,
            },
            include: {
                course: true,
            },
        });
        return this.toSessionDto(updatedSession);
    }
    async deleteSession(id) {
        const session = await this.prisma.cramschoolSessionRecord.findUnique({
            where: { sessionId: id },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        await this.prisma.cramschoolSessionRecord.delete({
            where: { sessionId: id },
        });
    }
    toSessionDto(session) {
        const result = {
            session_id: session.sessionId,
            course_id: session.courseId,
            session_date: session.sessionDate.toISOString().split('T')[0],
            course_name: session.course?.courseName || undefined,
        };
        return result;
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], SessionsService);


/***/ }),

/***/ "./src/cramschool/services/student-answers.service.ts":
/*!************************************************************!*\
  !*** ./src/cramschool/services/student-answers.service.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentAnswersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let StudentAnswersService = class StudentAnswersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentAnswers(includeDeleted = false, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolStudentAnswer.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    student: true,
                    question: true,
                },
                orderBy: { answerId: 'desc' },
            }),
            this.prisma.cramschoolStudentAnswer.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((a) => this.toStudentAnswerDto(a)), count, page, pageSize);
    }
    async getStudentAnswer(id) {
        const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
            where: { answerId: id },
            include: {
                student: true,
                question: true,
            },
        });
        if (!answer) {
            throw new common_1.NotFoundException(`StudentAnswer with ID ${id} not found`);
        }
        return this.toStudentAnswerDto(answer);
    }
    async createStudentAnswer(createDto) {
        const answer = await this.prisma.cramschoolStudentAnswer.create({
            data: {
                studentId: createDto.student_id,
                questionId: createDto.question_id,
                testName: createDto.test_name,
                submissionId: createDto.submission_id || null,
                isCorrect: createDto.is_correct || false,
                scannedFilePath: createDto.scanned_file_path || null,
            },
            include: {
                student: true,
                question: true,
            },
        });
        return this.toStudentAnswerDto(answer);
    }
    async updateStudentAnswer(id, updateDto) {
        const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
            where: { answerId: id },
        });
        if (!answer) {
            throw new common_1.NotFoundException(`StudentAnswer with ID ${id} not found`);
        }
        const updatedAnswer = await this.prisma.cramschoolStudentAnswer.update({
            where: { answerId: id },
            data: {
                studentId: updateDto.student_id,
                questionId: updateDto.question_id,
                testName: updateDto.test_name,
                submissionId: updateDto.submission_id !== undefined ? updateDto.submission_id : undefined,
                isCorrect: updateDto.is_correct,
                scannedFilePath: updateDto.scanned_file_path !== undefined ? updateDto.scanned_file_path : undefined,
            },
            include: {
                student: true,
                question: true,
            },
        });
        return this.toStudentAnswerDto(updatedAnswer);
    }
    async deleteStudentAnswer(id) {
        const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
            where: { answerId: id },
        });
        if (!answer) {
            throw new common_1.NotFoundException(`StudentAnswer with ID ${id} not found`);
        }
        await this.prisma.cramschoolStudentAnswer.update({
            where: { answerId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async restoreStudentAnswer(id) {
        const answer = await this.prisma.cramschoolStudentAnswer.findUnique({
            where: { answerId: id },
        });
        if (!answer) {
            throw new common_1.NotFoundException(`StudentAnswer with ID ${id} not found`);
        }
        if (!answer.isDeleted) {
            throw new common_1.NotFoundException(`StudentAnswer with ID ${id} is not deleted`);
        }
        const restoredAnswer = await this.prisma.cramschoolStudentAnswer.update({
            where: { answerId: id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
            include: {
                student: true,
                question: true,
            },
        });
        return this.toStudentAnswerDto(restoredAnswer);
    }
    toStudentAnswerDto(answer) {
        return {
            answer_id: answer.answerId,
            student_id: answer.studentId,
            question_id: answer.questionId,
            test_name: answer.testName,
            submission_id: answer.submissionId || null,
            is_correct: answer.isCorrect,
            scanned_file_path: answer.scannedFilePath || null,
            is_deleted: answer.isDeleted,
            deleted_at: answer.deletedAt?.toISOString() || null,
        };
    }
};
exports.StudentAnswersService = StudentAnswersService;
exports.StudentAnswersService = StudentAnswersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentAnswersService);


/***/ }),

/***/ "./src/cramschool/services/student-groups.service.ts":
/*!***********************************************************!*\
  !*** ./src/cramschool/services/student-groups.service.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentGroupsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let StudentGroupsService = class StudentGroupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentGroups(query) {
        const page = query.page || 1;
        const pageSize = query.page_size || 10;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        if (query.group_type) {
            where.groupType = query.group_type;
        }
        const count = await this.prisma.cramschoolStudentGroup.count({ where });
        const groups = await this.prisma.cramschoolStudentGroup.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                students: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        const groupsWithStats = groups.map((group) => ({
            ...this.toStudentGroupDto(group),
            student_count: group.students.length,
        }));
        return (0, pagination_util_1.createPaginatedResponse)(groupsWithStats, count, page, pageSize);
    }
    async getStudentGroup(id) {
        const group = await this.prisma.cramschoolStudentGroup.findUnique({
            where: { groupId: id },
            include: {
                students: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException(`Student group with ID ${id} not found`);
        }
        return this.toStudentGroupDto(group);
    }
    async createStudentGroup(createDto, userId) {
        const group = await this.prisma.cramschoolStudentGroup.create({
            data: {
                name: createDto.name,
                description: createDto.description || null,
                groupType: createDto.group_type || 'teaching',
                createdById: createDto.created_by_id || userId,
            },
        });
        return this.getStudentGroup(group.groupId);
    }
    async updateStudentGroup(id, updateDto) {
        const group = await this.prisma.cramschoolStudentGroup.findUnique({
            where: { groupId: id },
        });
        if (!group) {
            throw new common_1.NotFoundException(`Student group with ID ${id} not found`);
        }
        const updated = await this.prisma.cramschoolStudentGroup.update({
            where: { groupId: id },
            data: {
                name: updateDto.name,
                description: updateDto.description,
                groupType: updateDto.group_type,
            },
        });
        return this.getStudentGroup(updated.groupId);
    }
    async deleteStudentGroup(id) {
        const group = await this.prisma.cramschoolStudentGroup.findUnique({
            where: { groupId: id },
        });
        if (!group) {
            throw new common_1.NotFoundException(`Student group with ID ${id} not found`);
        }
        await this.prisma.cramschoolStudentGroup.delete({
            where: { groupId: id },
        });
    }
    async addStudentsToGroup(groupId, dto) {
        const group = await this.prisma.cramschoolStudentGroup.findUnique({
            where: { groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException(`Student group with ID ${groupId} not found`);
        }
        const students = await this.prisma.cramschoolStudent.findMany({
            where: {
                studentId: { in: dto.student_ids },
            },
        });
        if (students.length !== dto.student_ids.length) {
            const foundIds = students.map((s) => s.studentId);
            const missingIds = dto.student_ids.filter((id) => !foundIds.includes(id));
            throw new common_1.BadRequestException(`找不到以下學生 ID: ${missingIds.join(', ')}`);
        }
        await this.prisma.cramschoolStudentGroupStudent.createMany({
            data: dto.student_ids.map((studentId) => ({
                groupId,
                studentId,
            })),
            skipDuplicates: true,
        });
        return this.getStudentGroup(groupId);
    }
    async removeStudentsFromGroup(groupId, dto) {
        const group = await this.prisma.cramschoolStudentGroup.findUnique({
            where: { groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException(`Student group with ID ${groupId} not found`);
        }
        await this.prisma.cramschoolStudentGroupStudent.deleteMany({
            where: {
                groupId,
                studentId: { in: dto.student_ids },
            },
        });
        return this.getStudentGroup(groupId);
    }
    toStudentGroupDto(group) {
        return {
            group_id: group.groupId,
            name: group.name,
            description: group.description,
            group_type: group.groupType,
            created_by_id: group.createdById,
            created_at: group.createdAt.toISOString(),
            updated_at: group.updatedAt.toISOString(),
        };
    }
};
exports.StudentGroupsService = StudentGroupsService;
exports.StudentGroupsService = StudentGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentGroupsService);


/***/ }),

/***/ "./src/cramschool/services/student-mistake-note-images.service.ts":
/*!************************************************************************!*\
  !*** ./src/cramschool/services/student-mistake-note-images.service.ts ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentMistakeNoteImagesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let StudentMistakeNoteImagesService = class StudentMistakeNoteImagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentMistakeNoteImages(userId, userRole, noteId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (userRole !== 'STUDENT') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student) {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        if (noteId) {
            where.noteId = noteId;
            const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
                where: { noteId },
            });
            if (!note || note.studentId !== student.studentId) {
                return { count: 0, results: [], page: 1, page_size: pageSize };
            }
        }
        else {
            const notes = await this.prisma.cramschoolStudentMistakeNote.findMany({
                where: { studentId: student.studentId },
                select: { noteId: true },
            });
            where.noteId = { in: notes.map((n) => n.noteId) };
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolStudentMistakeNoteImage.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    note: {
                        include: {
                            student: true,
                        },
                    },
                },
                orderBy: [{ sortOrder: 'asc' }, { imageId: 'asc' }],
            }),
            this.prisma.cramschoolStudentMistakeNoteImage.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((img) => this.toStudentMistakeNoteImageDto(img)), count, page, pageSize);
    }
    async getStudentMistakeNoteImage(id, userId, userRole) {
        const image = await this.prisma.cramschoolStudentMistakeNoteImage.findUnique({
            where: { imageId: id },
            include: {
                note: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        if (!image) {
            throw new common_1.NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
        }
        if (userRole !== 'STUDENT') {
            throw new common_1.NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student || image.note.studentId !== student.studentId) {
            throw new common_1.NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
        }
        return this.toStudentMistakeNoteImageDto(image);
    }
    async createStudentMistakeNoteImage(createDto, userId, userRole) {
        if (userRole !== 'STUDENT') {
            throw new common_1.ForbiddenException('只有學生可以新增錯題筆記圖片');
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student) {
            throw new common_1.ForbiddenException('找不到學生資料');
        }
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId: createDto.note_id },
        });
        if (!note || note.studentId !== student.studentId) {
            throw new common_1.ForbiddenException('只能為自己的錯題筆記添加圖片');
        }
        const image = await this.prisma.cramschoolStudentMistakeNoteImage.create({
            data: {
                noteId: createDto.note_id,
                imagePath: createDto.image_path,
                caption: createDto.caption || null,
                sortOrder: createDto.sort_order || 0,
            },
            include: {
                note: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        return this.toStudentMistakeNoteImageDto(image);
    }
    async updateStudentMistakeNoteImage(id, updateDto, userId, userRole) {
        const image = await this.prisma.cramschoolStudentMistakeNoteImage.findUnique({
            where: { imageId: id },
            include: {
                note: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        if (!image) {
            throw new common_1.NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
        }
        if (userRole !== 'STUDENT') {
            throw new common_1.ForbiddenException('只有學生可以編輯錯題筆記圖片');
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student || image.note.studentId !== student.studentId) {
            throw new common_1.ForbiddenException('只能編輯自己的錯題筆記圖片');
        }
        const updatedImage = await this.prisma.cramschoolStudentMistakeNoteImage.update({
            where: { imageId: id },
            data: {
                caption: updateDto.caption !== undefined ? updateDto.caption : undefined,
                sortOrder: updateDto.sort_order !== undefined ? updateDto.sort_order : undefined,
            },
            include: {
                note: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        return this.toStudentMistakeNoteImageDto(updatedImage);
    }
    async deleteStudentMistakeNoteImage(id, userId, userRole) {
        const image = await this.prisma.cramschoolStudentMistakeNoteImage.findUnique({
            where: { imageId: id },
            include: {
                note: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        if (!image) {
            throw new common_1.NotFoundException(`StudentMistakeNoteImage with ID ${id} not found`);
        }
        if (userRole !== 'STUDENT') {
            throw new common_1.ForbiddenException('只有學生可以刪除錯題筆記圖片');
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student || image.note.studentId !== student.studentId) {
            throw new common_1.ForbiddenException('只能刪除自己的錯題筆記圖片');
        }
        await this.prisma.cramschoolStudentMistakeNoteImage.delete({
            where: { imageId: id },
        });
    }
    toStudentMistakeNoteImageDto(image) {
        return {
            image_id: image.imageId,
            note_id: image.noteId,
            image_path: image.imagePath,
            caption: image.caption || null,
            sort_order: image.sortOrder,
            created_at: image.createdAt?.toISOString(),
        };
    }
};
exports.StudentMistakeNoteImagesService = StudentMistakeNoteImagesService;
exports.StudentMistakeNoteImagesService = StudentMistakeNoteImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentMistakeNoteImagesService);


/***/ }),

/***/ "./src/cramschool/services/student-mistake-notes.service.ts":
/*!******************************************************************!*\
  !*** ./src/cramschool/services/student-mistake-notes.service.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentMistakeNotesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs/promises */ "fs/promises");
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
let StudentMistakeNotesService = class StudentMistakeNotesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentMistakeNotes(userId, userRole, includeDeleted = false, studentId, searchQuery, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (userRole === 'ACCOUNTANT') {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        if (userRole === 'STUDENT') {
            const student = await this.prisma.cramschoolStudent.findFirst({
                where: { userId },
            });
            if (student) {
                where.studentId = student.studentId;
            }
            else {
                return { count: 0, results: [], page: 1, page_size: pageSize };
            }
        }
        else if (userRole === 'TEACHER' || userRole === 'ADMIN') {
            if (studentId) {
                where.studentId = studentId;
            }
            else {
                return { count: 0, results: [], page: 1, page_size: pageSize };
            }
        }
        else {
            return { count: 0, results: [], page: 1, page_size: pageSize };
        }
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        if (searchQuery) {
            where.OR = [
                { title: { contains: searchQuery } },
                { subject: { contains: searchQuery } },
                { content: { contains: searchQuery } },
            ];
        }
        const [results, count] = await Promise.all([
            this.prisma.cramschoolStudentMistakeNote.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    student: true,
                },
                orderBy: [{ updatedAt: 'desc' }, { noteId: 'desc' }],
            }),
            this.prisma.cramschoolStudentMistakeNote.count({ where }),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((n) => this.toStudentMistakeNoteDto(n)), count, page, pageSize);
    }
    async getStudentMistakeNote(id, userId, userRole) {
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId: id },
            include: {
                student: true,
            },
        });
        if (!note) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} not found`);
        }
        if (userRole === 'STUDENT') {
            const student = await this.prisma.cramschoolStudent.findFirst({
                where: { userId },
            });
            if (!student || note.studentId !== student.studentId) {
                throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} not found`);
            }
        }
        else if (userRole === 'ACCOUNTANT') {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} not found`);
        }
        return this.toStudentMistakeNoteDto(note);
    }
    async createStudentMistakeNote(createDto, userId, userRole) {
        if (userRole !== 'STUDENT') {
            throw new common_1.ForbiddenException('只有學生可以新增錯題筆記');
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student) {
            throw new common_1.ForbiddenException('找不到學生資料');
        }
        const note = await this.prisma.cramschoolStudentMistakeNote.create({
            data: {
                studentId: student.studentId,
                title: createDto.title,
                subject: createDto.subject || null,
                content: createDto.content || null,
            },
            include: {
                student: true,
            },
        });
        return this.toStudentMistakeNoteDto(note);
    }
    async updateStudentMistakeNote(id, updateDto, userId, userRole) {
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId: id },
        });
        if (!note) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} not found`);
        }
        if (userRole !== 'STUDENT') {
            throw new common_1.ForbiddenException('只有學生可以編輯錯題筆記');
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student || note.studentId !== student.studentId) {
            throw new common_1.ForbiddenException('只能編輯自己的錯題筆記');
        }
        const updatedNote = await this.prisma.cramschoolStudentMistakeNote.update({
            where: { noteId: id },
            data: {
                title: updateDto.title,
                subject: updateDto.subject !== undefined ? updateDto.subject : undefined,
                content: updateDto.content !== undefined ? updateDto.content : undefined,
            },
            include: {
                student: true,
            },
        });
        return this.toStudentMistakeNoteDto(updatedNote);
    }
    async deleteStudentMistakeNote(id, userId, userRole) {
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId: id },
        });
        if (!note) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} not found`);
        }
        if (userRole !== 'STUDENT') {
            throw new common_1.ForbiddenException('只有學生可以刪除錯題筆記');
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student || note.studentId !== student.studentId) {
            throw new common_1.ForbiddenException('只能刪除自己的錯題筆記');
        }
        await this.prisma.cramschoolStudentMistakeNote.update({
            where: { noteId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async restoreStudentMistakeNote(id) {
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId: id },
        });
        if (!note) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} not found`);
        }
        if (!note.isDeleted) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} is not deleted`);
        }
        const restoredNote = await this.prisma.cramschoolStudentMistakeNote.update({
            where: { noteId: id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
            include: {
                student: true,
            },
        });
        return this.toStudentMistakeNoteDto(restoredNote);
    }
    async importToQuestionBank(id, userId, body) {
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId: id },
            include: {
                student: true,
            },
        });
        if (!note) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} not found`);
        }
        if (note.isDeleted) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${id} is deleted`);
        }
        const newQuestion = await this.prisma.cramschoolQuestionBank.create({
            data: {
                subjectId: body.subject_id,
                level: body.level,
                chapter: body.chapter,
                content: body.content,
                correctAnswer: body.correct_answer,
                difficulty: body.difficulty || 3,
                questionNumber: body.question_number || null,
                origin: body.origin || '',
                originDetail: body.origin_detail || '',
                solutionContent: body.solution_content || '',
                imagePath: body.image_path || null,
                source: 'imported_from_student_note',
                createdById: userId,
                importedStudentId: note.studentId,
            },
        });
        if (body.tag_ids && body.tag_ids.length > 0) {
            const tagRelations = body.tag_ids.map((tagId) => ({
                questionId: newQuestion.questionId,
                tagId,
            }));
            await this.prisma.cramschoolQuestionTag.createMany({
                data: tagRelations,
                skipDuplicates: true,
            });
        }
        return newQuestion;
    }
    async uploadImages(noteId, userId, files) {
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId },
            include: {
                student: true,
            },
        });
        if (!note) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${noteId} not found`);
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student || note.studentId !== student.studentId) {
            throw new common_1.ForbiddenException('只能操作自己的錯題筆記');
        }
        const maxSortOrder = await this.prisma.cramschoolStudentMistakeNoteImage.aggregate({
            where: { noteId },
            _max: { sortOrder: true },
        });
        const currentMax = maxSortOrder._max.sortOrder || 0;
        const created = [];
        for (let idx = 0; idx < files.length; idx++) {
            const file = files[idx];
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const fileExt = path.extname(file.originalname).slice(1).toLowerCase();
            if (!allowedExtensions.includes(fileExt)) {
                throw new common_1.BadRequestException(`不支援的文件類型。允許的類型：${allowedExtensions.join(', ')}`);
            }
            if (file.size > 5 * 1024 * 1024) {
                throw new common_1.BadRequestException('圖片文件大小不能超過 5MB');
            }
            const now = new Date();
            const dateFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
            const uniqueFilename = `${(0, uuid_1.v4)().replace(/-/g, '')}.${fileExt}`;
            const relativePath = `mistake_images/${dateFolder}/${uniqueFilename}`;
            const mediaRoot = process.env.MEDIA_ROOT || './media';
            const fullPath = path.join(mediaRoot, relativePath);
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(fullPath, file.buffer);
            const mediaUrl = process.env.MEDIA_URL || '/media/';
            const imageUrl = mediaUrl.startsWith('http')
                ? `${mediaUrl}${relativePath}`
                : `${process.env.BASE_URL || 'http://localhost:3000'}${mediaUrl}${relativePath}`;
            const image = await this.prisma.cramschoolStudentMistakeNoteImage.create({
                data: {
                    noteId,
                    imagePath: relativePath,
                    sortOrder: currentMax + idx + 1,
                },
                include: {
                    note: {
                        include: {
                            student: true,
                        },
                    },
                },
            });
            created.push({
                image_id: image.imageId,
                note_id: image.noteId,
                image_path: image.imagePath,
                image_url: imageUrl,
                caption: image.caption || null,
                sort_order: image.sortOrder,
                created_at: image.createdAt?.toISOString(),
            });
        }
        return created;
    }
    async reorderImages(noteId, userId, imageIds) {
        const note = await this.prisma.cramschoolStudentMistakeNote.findUnique({
            where: { noteId },
        });
        if (!note) {
            throw new common_1.NotFoundException(`StudentMistakeNote with ID ${noteId} not found`);
        }
        const student = await this.prisma.cramschoolStudent.findFirst({
            where: { userId },
        });
        if (!student || note.studentId !== student.studentId) {
            throw new common_1.ForbiddenException('只能操作自己的錯題筆記');
        }
        const images = await this.prisma.cramschoolStudentMistakeNoteImage.findMany({
            where: {
                noteId,
                imageId: { in: imageIds },
            },
        });
        if (images.length !== imageIds.length) {
            throw new common_1.BadRequestException('image_ids 包含不屬於此筆記的圖片');
        }
        const updates = imageIds.map((imageId, index) => this.prisma.cramschoolStudentMistakeNoteImage.update({
            where: { imageId },
            data: { sortOrder: index + 1 },
        }));
        await Promise.all(updates);
        return { success: true };
    }
    toStudentMistakeNoteDto(note) {
        return {
            note_id: note.noteId,
            student_id: note.studentId,
            title: note.title,
            subject: note.subject || null,
            content: note.content || null,
            created_at: note.createdAt?.toISOString(),
            updated_at: note.updatedAt?.toISOString(),
            is_deleted: note.isDeleted,
            deleted_at: note.deletedAt?.toISOString() || null,
        };
    }
};
exports.StudentMistakeNotesService = StudentMistakeNotesService;
exports.StudentMistakeNotesService = StudentMistakeNotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentMistakeNotesService);


/***/ }),

/***/ "./src/cramschool/services/students/students-fee.service.ts":
/*!******************************************************************!*\
  !*** ./src/cramschool/services/students/students-fee.service.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentsFeeService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
let StudentsFeeService = class StudentsFeeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTuitionStatus(id) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
            include: {
                enrollments: {
                    where: { isDeleted: false, isActive: true },
                    include: {
                        course: true,
                        periods: {
                            where: { isActive: true },
                            orderBy: { startDate: 'asc' },
                        },
                    },
                },
                extraFees: {
                    where: { isDeleted: false },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        const [totalFees, unpaidFees] = await Promise.all([
            this.prisma.cramschoolExtraFee.aggregate({
                where: {
                    studentId: id,
                    isDeleted: false,
                },
                _sum: { amount: true },
            }),
            this.prisma.cramschoolExtraFee.aggregate({
                where: {
                    studentId: id,
                    isDeleted: false,
                    paymentStatus: 'Unpaid',
                },
                _sum: { amount: true },
            }),
        ]);
        const tuitionMonths = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        for (const enrollment of student.enrollments) {
            if (!enrollment.periods || enrollment.periods.length === 0) {
                const existingFee = student.extraFees.find((fee) => fee.feeDate.getFullYear() === currentYear &&
                    fee.feeDate.getMonth() + 1 === currentMonth &&
                    fee.item === '學費');
                if (!existingFee) {
                    tuitionMonths.push({
                        year: currentYear,
                        month: currentMonth,
                        enrollment_id: enrollment.enrollmentId,
                        course_name: enrollment.course.courseName,
                        has_fee: false,
                        weeks: 4,
                    });
                }
            }
            else {
                for (const period of enrollment.periods) {
                    const startDate = new Date(period.startDate);
                    const endDate = period.endDate ? new Date(period.endDate) : new Date(currentYear + 1, 11, 31);
                    let date = new Date(startDate);
                    while (date <= endDate) {
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;
                        const existingFee = student.extraFees.find((fee) => fee.feeDate.getFullYear() === year &&
                            fee.feeDate.getMonth() + 1 === month &&
                            fee.item === '學費');
                        if (!existingFee) {
                            tuitionMonths.push({
                                year,
                                month,
                                enrollment_id: enrollment.enrollmentId,
                                course_name: enrollment.course.courseName,
                                has_fee: false,
                                weeks: 4,
                            });
                        }
                        date = new Date(year, month, 1);
                    }
                }
            }
        }
        return {
            student_id: id,
            total_unpaid: Number(unpaidFees._sum.amount || 0),
            total_paid: Number(totalFees._sum.amount || 0) - Number(unpaidFees._sum.amount || 0),
            tuition_months: tuitionMonths,
        };
    }
    async generateTuition(id, data) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
            include: {
                enrollments: {
                    where: { enrollmentId: data.enrollment_id, isDeleted: false },
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        const enrollment = student.enrollments[0];
        if (!enrollment) {
            throw new common_1.NotFoundException(`Enrollment with ID ${data.enrollment_id} not found`);
        }
        const courseFee = Number(enrollment.course.feePerSession) || 0;
        const totalAmount = (courseFee / 4) * data.weeks;
        const feeDate = new Date(data.year, data.month - 1, 1);
        const fee = await this.prisma.cramschoolExtraFee.create({
            data: {
                studentId: id,
                item: '學費',
                amount: totalAmount,
                feeDate,
                paymentStatus: 'Unpaid',
                notes: `${enrollment.course.courseName} - ${data.year}年${data.month}月 - ${data.weeks}週`,
            },
        });
        return fee;
    }
    async batchGenerateTuitions(studentIds, weeks = 4) {
        let totalStudents = 0;
        let successCount = 0;
        let failCount = 0;
        let totalFeesGenerated = 0;
        const errors = [];
        for (const studentId of studentIds) {
            totalStudents++;
            try {
                const tuitionStatus = await this.getTuitionStatus(studentId);
                const months = tuitionStatus.tuition_months || [];
                for (const month of months) {
                    try {
                        await this.generateTuition(studentId, {
                            year: month.year,
                            month: month.month,
                            enrollment_id: month.enrollment_id,
                            weeks,
                        });
                        totalFeesGenerated++;
                    }
                    catch (error) {
                        errors.push({
                            student_id: studentId,
                            year: month.year,
                            month: month.month,
                            error: error.message,
                        });
                    }
                }
                successCount++;
            }
            catch (error) {
                failCount++;
                errors.push({
                    student_id: studentId,
                    error: error.message,
                });
            }
        }
        return {
            total_students: totalStudents,
            success_count: successCount,
            fail_count: failCount,
            total_fees_generated: totalFeesGenerated,
            errors,
        };
    }
};
exports.StudentsFeeService = StudentsFeeService;
exports.StudentsFeeService = StudentsFeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentsFeeService);


/***/ }),

/***/ "./src/cramschool/services/students/students-permission.service.ts":
/*!*************************************************************************!*\
  !*** ./src/cramschool/services/students/students-permission.service.ts ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentsPermissionService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let StudentsPermissionService = class StudentsPermissionService {
    checkCreatePermission(userRole) {
        if (userRole !== 'ADMIN' && userRole !== 'ACCOUNTANT') {
            throw new common_1.ForbiddenException('只有管理員或會計可以創建學生');
        }
    }
};
exports.StudentsPermissionService = StudentsPermissionService;
exports.StudentsPermissionService = StudentsPermissionService = __decorate([
    (0, common_1.Injectable)()
], StudentsPermissionService);


/***/ }),

/***/ "./src/cramschool/services/students/students-query.service.ts":
/*!********************************************************************!*\
  !*** ./src/cramschool/services/students/students-query.service.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentsQueryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
let StudentsQueryService = class StudentsQueryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildWhereClause(query, userId, userRole) {
        const where = {};
        if (userRole === 'TEACHER') {
            const teacher = await this.prisma.cramschoolTeacher.findFirst({
                where: { userId },
            });
            if (!teacher) {
                return { _empty: true };
            }
            const teacherCourses = await this.prisma.cramschoolCourse.findMany({
                where: { teacherId: teacher.teacherId },
                select: { courseId: true },
            });
            const courseIds = teacherCourses.map((c) => c.courseId);
            const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
                where: {
                    courseId: { in: courseIds },
                    isDeleted: false,
                },
                select: { studentId: true },
                distinct: ['studentId'],
            });
            const studentIds = enrollments.map((e) => e.studentId);
            where.studentId = { in: studentIds };
        }
        else if (userRole === 'STUDENT') {
            const student = await this.prisma.cramschoolStudent.findFirst({
                where: { userId },
            });
            if (!student) {
                return { _empty: true };
            }
            where.studentId = student.studentId;
        }
        if (!query.include_deleted) {
            where.isDeleted = false;
        }
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        if (query.school) {
            where.school = { contains: query.school, mode: 'insensitive' };
        }
        if (query.grade) {
            where.grade = query.grade;
        }
        if (query.tag) {
            const tagId = parseInt(query.tag);
            if (!isNaN(tagId)) {
                const studentsInGroup = await this.prisma.cramschoolStudentGroupStudent.findMany({
                    where: { groupId: tagId },
                    select: { studentId: true },
                });
                const studentIds = studentsInGroup.map((s) => s.studentId);
                where.studentId = where.studentId
                    ? { in: studentIds.filter((id) => where.studentId.in?.includes(id) || true) }
                    : { in: studentIds };
            }
        }
        if (query.course) {
            const courseId = parseInt(query.course);
            if (!isNaN(courseId)) {
                const enrollments = await this.prisma.cramschoolStudentEnrollment.findMany({
                    where: {
                        courseId,
                        isDeleted: false,
                    },
                    select: { studentId: true },
                });
                const studentIds = enrollments.map((e) => e.studentId);
                where.studentId = where.studentId
                    ? { in: studentIds.filter((id) => where.studentId.in?.includes(id) || true) }
                    : { in: studentIds };
            }
        }
        if (query.has_unpaid_fees === 'yes') {
            const studentsWithUnpaid = await this.prisma.cramschoolExtraFee.groupBy({
                by: ['studentId'],
                where: {
                    isDeleted: false,
                    paymentStatus: 'Unpaid',
                },
                having: {
                    studentId: {
                        _count: { gt: 0 },
                    },
                },
            });
            const studentIds = studentsWithUnpaid.map((s) => s.studentId);
            where.studentId = where.studentId
                ? { in: studentIds.filter((id) => where.studentId.in?.includes(id) || true) }
                : { in: studentIds };
        }
        return where;
    }
    isEmptyCondition(where) {
        return where._empty === true;
    }
};
exports.StudentsQueryService = StudentsQueryService;
exports.StudentsQueryService = StudentsQueryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentsQueryService);


/***/ }),

/***/ "./src/cramschool/services/students/students-stats.service.ts":
/*!********************************************************************!*\
  !*** ./src/cramschool/services/students/students-stats.service.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentsStatsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
let StudentsStatsService = class StudentsStatsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateStudentStats(student) {
        const [totalFees, unpaidFees] = await Promise.all([
            this.prisma.cramschoolExtraFee.aggregate({
                where: {
                    studentId: student.studentId,
                    isDeleted: false,
                },
                _sum: { amount: true },
            }),
            this.prisma.cramschoolExtraFee.aggregate({
                where: {
                    studentId: student.studentId,
                    isDeleted: false,
                    paymentStatus: 'Unpaid',
                },
                _sum: { amount: true },
            }),
        ]);
        let hasTuitionNeeded = false;
        if (student.enrollments && student.enrollments.length > 0) {
            const activeEnrollments = student.enrollments.filter((e) => !e.isDeleted && e.isActive);
            if (activeEnrollments.length > 0) {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1;
                for (const enrollment of activeEnrollments) {
                    if (!enrollment.periods || enrollment.periods.length === 0) {
                        const existingFee = student.extraFees?.find((fee) => fee.feeDate.getFullYear() === currentYear &&
                            fee.feeDate.getMonth() + 1 === currentMonth &&
                            fee.item === '學費');
                        if (!existingFee) {
                            hasTuitionNeeded = true;
                            break;
                        }
                    }
                    else {
                        for (const period of enrollment.periods) {
                            const startDate = new Date(period.startDate);
                            const endDate = period.endDate ? new Date(period.endDate) : new Date(currentYear + 1, 11, 31);
                            let date = new Date(startDate);
                            while (date <= endDate && !hasTuitionNeeded) {
                                const year = date.getFullYear();
                                const month = date.getMonth() + 1;
                                const existingFee = student.extraFees?.find((fee) => fee.feeDate.getFullYear() === year &&
                                    fee.feeDate.getMonth() + 1 === month &&
                                    fee.item === '學費');
                                if (!existingFee) {
                                    hasTuitionNeeded = true;
                                    break;
                                }
                                date = new Date(year, month, 1);
                            }
                            if (hasTuitionNeeded)
                                break;
                        }
                        if (hasTuitionNeeded)
                            break;
                    }
                }
            }
        }
        return {
            total_fees: Number(totalFees._sum.amount || 0),
            unpaid_fees: Number(unpaidFees._sum.amount || 0),
            enrollments_count: student.enrollments.length,
            has_tuition_needed: hasTuitionNeeded,
        };
    }
};
exports.StudentsStatsService = StudentsStatsService;
exports.StudentsStatsService = StudentsStatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentsStatsService);


/***/ }),

/***/ "./src/cramschool/services/students/students.service.ts":
/*!**************************************************************!*\
  !*** ./src/cramschool/services/students/students.service.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
const students_query_service_1 = __webpack_require__(/*! ./students-query.service */ "./src/cramschool/services/students/students-query.service.ts");
const students_fee_service_1 = __webpack_require__(/*! ./students-fee.service */ "./src/cramschool/services/students/students-fee.service.ts");
const students_permission_service_1 = __webpack_require__(/*! ./students-permission.service */ "./src/cramschool/services/students/students-permission.service.ts");
const students_stats_service_1 = __webpack_require__(/*! ./students-stats.service */ "./src/cramschool/services/students/students-stats.service.ts");
let StudentsService = class StudentsService {
    constructor(prisma, queryService, feeService, permissionService, statsService) {
        this.prisma = prisma;
        this.queryService = queryService;
        this.feeService = feeService;
        this.permissionService = permissionService;
        this.statsService = statsService;
    }
    async getStudents(query, userId, userRole) {
        const page = query.page || 1;
        const pageSize = query.page_size || 10;
        const skip = (page - 1) * pageSize;
        const where = await this.queryService.buildWhereClause(query, userId, userRole);
        if (this.queryService.isEmptyCondition(where)) {
            return (0, pagination_util_1.createPaginatedResponse)([], 0, page, pageSize);
        }
        delete where._empty;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolStudent.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    user: true,
                    enrollments: {
                        where: { isDeleted: false },
                        include: {
                            course: true,
                            periods: {
                                where: { isActive: true },
                                orderBy: { startDate: 'asc' },
                            },
                        },
                    },
                    extraFees: {
                        where: { isDeleted: false },
                    },
                    studentGroups: {
                        include: {
                            group: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.cramschoolStudent.count({ where }),
        ]);
        const studentsWithStats = await Promise.all(results.map(async (student) => {
            const stats = await this.statsService.calculateStudentStats(student);
            return {
                ...this.toStudentDto(student),
                ...stats,
                student_groups: student.studentGroups?.map((sg) => ({
                    group_id: sg.group.groupId,
                    name: sg.group.name,
                    description: sg.group.description,
                    group_type: sg.group.groupType,
                })) || [],
                enrollments: student.enrollments.map((e) => ({
                    enrollment_id: e.enrollmentId,
                    course_id: e.courseId,
                    course_name: e.course.courseName,
                    enroll_date: e.enrollDate.toISOString().split('T')[0],
                    discount_rate: Number(e.discountRate),
                    is_active: e.isActive,
                })),
            };
        }));
        return (0, pagination_util_1.createPaginatedResponse)(studentsWithStats, count, page, pageSize);
    }
    async getStudent(id) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
            include: {
                user: true,
                enrollments: {
                    where: { isDeleted: false },
                    include: {
                        course: true,
                        periods: {
                            where: { isActive: true },
                        },
                    },
                },
                extraFees: {
                    where: { isDeleted: false },
                },
                studentGroups: {
                    include: {
                        group: true,
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        return {
            ...this.toStudentDto(student),
            student_groups: student.studentGroups?.map((sg) => ({
                group_id: sg.group.groupId,
                name: sg.group.name,
                description: sg.group.description,
                group_type: sg.group.groupType,
            })) || [],
            enrollments: student.enrollments.map((e) => ({
                enrollment_id: e.enrollmentId,
                course_id: e.courseId,
                course_name: e.course.courseName,
                enroll_date: e.enrollDate.toISOString().split('T')[0],
                discount_rate: Number(e.discountRate),
                is_active: e.isActive,
            })),
        };
    }
    async createStudent(createDto, userId, userRole) {
        this.permissionService.checkCreatePermission(userRole);
        const student = await this.prisma.cramschoolStudent.create({
            data: {
                name: createDto.name,
                school: createDto.school,
                grade: createDto.grade,
                phone: createDto.phone || null,
                emergencyContactName: createDto.emergency_contact_name || null,
                emergencyContactPhone: createDto.emergency_contact_phone || null,
                notes: createDto.notes || null,
                initialPassword: createDto.initial_password || null,
            },
        });
        if (createDto.initial_password) {
            const username = `student_${student.studentId}`;
            const email = `${username}@student.local`;
            const hashedPassword = await (__webpack_require__(/*! bcrypt */ "bcrypt").hash)(createDto.initial_password, 10);
            const user = await this.prisma.accountCustomUser.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    role: 'STUDENT',
                    firstName: createDto.name,
                    isActive: true,
                    mustChangePassword: false,
                },
            });
            await this.prisma.cramschoolStudent.update({
                where: { studentId: student.studentId },
                data: { userId: user.id },
            });
        }
        return this.getStudent(student.studentId);
    }
    async updateStudent(id, updateDto) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        await this.prisma.cramschoolStudent.update({
            where: { studentId: id },
            data: {
                name: updateDto.name,
                school: updateDto.school,
                grade: updateDto.grade,
                phone: updateDto.phone,
                emergencyContactName: updateDto.emergency_contact_name,
                emergencyContactPhone: updateDto.emergency_contact_phone,
                notes: updateDto.notes,
            },
        });
        return this.getStudent(id);
    }
    async deleteStudent(id) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        await this.prisma.cramschoolStudent.update({
            where: { studentId: id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
        await Promise.all([
            this.prisma.cramschoolStudentEnrollment.updateMany({
                where: { studentId: id, isDeleted: false },
                data: { isDeleted: true, deletedAt: new Date() },
            }),
            this.prisma.cramschoolExtraFee.updateMany({
                where: { studentId: id, isDeleted: false },
                data: { isDeleted: true, deletedAt: new Date() },
            }),
            this.prisma.cramschoolAttendance.updateMany({
                where: { studentId: id, isDeleted: false },
                data: { isDeleted: true, deletedAt: new Date() },
            }),
            this.prisma.cramschoolLeave.updateMany({
                where: { studentId: id, isDeleted: false },
                data: { isDeleted: true, deletedAt: new Date() },
            }),
        ]);
    }
    async restoreStudent(id) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        await this.prisma.cramschoolStudent.update({
            where: { studentId: id },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });
        return this.getStudent(id);
    }
    async getTuitionStatus(id) {
        return this.feeService.getTuitionStatus(id);
    }
    async generateTuition(id, data) {
        return this.feeService.generateTuition(id, data);
    }
    async batchGenerateTuitions(studentIds, weeks = 4) {
        return this.feeService.batchGenerateTuitions(studentIds, weeks);
    }
    async resetPassword(id, password) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
            include: { user: true },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        if (!student.userId) {
            throw new common_1.NotFoundException(`Student with ID ${id} does not have a user account`);
        }
        const hashedPassword = await (__webpack_require__(/*! bcrypt */ "bcrypt").hash)(password, 10);
        await this.prisma.accountCustomUser.update({
            where: { id: student.userId },
            data: { password: hashedPassword },
        });
        return {
            password,
        };
    }
    async toggleAccountStatus(id) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
            include: { user: true },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        if (!student.userId) {
            throw new common_1.NotFoundException(`Student with ID ${id} does not have a user account`);
        }
        const user = await this.prisma.accountCustomUser.findUnique({
            where: { id: student.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${student.userId} not found`);
        }
        const updated = await this.prisma.accountCustomUser.update({
            where: { id: student.userId },
            data: {
                isActive: !user.isActive,
            },
        });
        return {
            is_active: updated.isActive,
        };
    }
    toStudentDto(student) {
        return {
            student_id: student.studentId,
            name: student.name,
            school: student.school,
            grade: student.grade,
            phone: student.phone,
            emergency_contact_name: student.emergencyContactName,
            emergency_contact_phone: student.emergencyContactPhone,
            notes: student.notes,
            is_deleted: student.isDeleted,
            deleted_at: student.deletedAt?.toISOString() || null,
            user_id: student.userId,
            initial_password: student.initialPassword,
        };
    }
    async getAttendanceAndLeaves(id) {
        const student = await this.prisma.cramschoolStudent.findUnique({
            where: { studentId: id },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        const attendances = await this.prisma.cramschoolAttendance.findMany({
            where: {
                studentId: id,
                isDeleted: false,
            },
            include: {
                session: {
                    include: {
                        course: true,
                    },
                },
                student: true,
            },
            orderBy: {
                session: {
                    sessionDate: 'desc',
                },
            },
        });
        const leaves = await this.prisma.cramschoolLeave.findMany({
            where: {
                studentId: id,
                isDeleted: false,
            },
            include: {
                course: true,
                student: true,
            },
            orderBy: {
                leaveDate: 'desc',
            },
        });
        const attendanceData = attendances.map((a) => ({
            attendance_id: a.attendanceId,
            session_id: a.sessionId,
            session_id_display: a.session?.sessionId,
            student_id: a.studentId,
            student_name: a.student?.name,
            status: a.status,
            course_name: a.session?.course?.courseName,
            session_date: a.session?.sessionDate
                ? a.session.sessionDate.toISOString().split('T')[0]
                : null,
            is_deleted: a.isDeleted,
            deleted_at: a.deletedAt?.toISOString() || null,
        }));
        const leaveData = leaves.map((l) => ({
            leave_id: l.leaveId,
            student_id: l.studentId,
            course_id: l.courseId,
            leave_date: l.leaveDate.toISOString().split('T')[0],
            reason: l.reason,
            approval_status: l.approvalStatus,
            course_name: l.course?.courseName,
            student_name: l.student?.name,
            is_deleted: l.isDeleted,
            deleted_at: l.deletedAt?.toISOString() || null,
        }));
        return {
            student_id: student.studentId,
            student_name: student.name,
            attendances: attendanceData,
            leaves: leaveData,
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof students_query_service_1.StudentsQueryService !== "undefined" && students_query_service_1.StudentsQueryService) === "function" ? _b : Object, typeof (_c = typeof students_fee_service_1.StudentsFeeService !== "undefined" && students_fee_service_1.StudentsFeeService) === "function" ? _c : Object, typeof (_d = typeof students_permission_service_1.StudentsPermissionService !== "undefined" && students_permission_service_1.StudentsPermissionService) === "function" ? _d : Object, typeof (_e = typeof students_stats_service_1.StudentsStatsService !== "undefined" && students_stats_service_1.StudentsStatsService) === "function" ? _e : Object])
], StudentsService);


/***/ }),

/***/ "./src/cramschool/services/subjects.service.ts":
/*!*****************************************************!*\
  !*** ./src/cramschool/services/subjects.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubjectsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let SubjectsService = class SubjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSubjects(page = 1, pageSize = 10, userRole) {
        if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
            return (0, pagination_util_1.createPaginatedResponse)([], 0, page, pageSize);
        }
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolSubject.findMany({
                skip,
                take: pageSize,
                orderBy: { name: 'asc' },
            }),
            this.prisma.cramschoolSubject.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((s) => this.toSubjectDto(s)), count, page, pageSize);
    }
    async getSubject(id, userRole) {
        if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
            throw new common_1.ForbiddenException('您沒有權限查看科目');
        }
        const subject = await this.prisma.cramschoolSubject.findUnique({
            where: { subjectId: id },
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Subject with ID ${id} not found`);
        }
        return this.toSubjectDto(subject);
    }
    async createSubject(createDto, userRole) {
        if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
            throw new common_1.ForbiddenException('您沒有權限創建科目');
        }
        const subject = await this.prisma.cramschoolSubject.create({
            data: {
                name: createDto.name,
                code: createDto.code || null,
                description: createDto.description || null,
            },
        });
        return this.toSubjectDto(subject);
    }
    async updateSubject(id, updateDto, userRole) {
        if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
            throw new common_1.ForbiddenException('您沒有權限更新科目');
        }
        const subject = await this.prisma.cramschoolSubject.findUnique({
            where: { subjectId: id },
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Subject with ID ${id} not found`);
        }
        const updatedSubject = await this.prisma.cramschoolSubject.update({
            where: { subjectId: id },
            data: {
                name: updateDto.name,
                code: updateDto.code,
                description: updateDto.description,
            },
        });
        return this.toSubjectDto(updatedSubject);
    }
    async deleteSubject(id, userRole) {
        if (userRole === 'STUDENT' || userRole === 'ACCOUNTANT') {
            throw new common_1.ForbiddenException('您沒有權限刪除科目');
        }
        const subject = await this.prisma.cramschoolSubject.findUnique({
            where: { subjectId: id },
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Subject with ID ${id} not found`);
        }
        await this.prisma.cramschoolSubject.delete({
            where: { subjectId: id },
        });
    }
    toSubjectDto(subject) {
        return {
            subject_id: subject.subjectId,
            name: subject.name,
            code: subject.code || null,
            description: subject.description || null,
            created_at: subject.createdAt?.toISOString(),
        };
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], SubjectsService);


/***/ }),

/***/ "./src/cramschool/services/teachers.service.ts":
/*!*****************************************************!*\
  !*** ./src/cramschool/services/teachers.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TeachersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let TeachersService = class TeachersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTeachers(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [results, count] = await Promise.all([
            this.prisma.cramschoolTeacher.findMany({
                skip,
                take: pageSize,
                include: {
                    user: true,
                    courses: true,
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.cramschoolTeacher.count(),
        ]);
        return (0, pagination_util_1.createPaginatedResponse)(results.map((t) => this.toTeacherDto(t)), count, page, pageSize);
    }
    async getTeacher(id) {
        const teacher = await this.prisma.cramschoolTeacher.findUnique({
            where: { teacherId: id },
            include: {
                user: true,
                courses: true,
            },
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Teacher with ID ${id} not found`);
        }
        return this.toTeacherDto(teacher);
    }
    async createTeacher(createDto) {
        const teacher = await this.prisma.cramschoolTeacher.create({
            data: {
                name: createDto.name,
                permissionLevel: createDto.permission_level || 'Teacher',
                phone: createDto.phone || null,
                hireDate: createDto.hire_date ? new Date(createDto.hire_date) : null,
                userId: createDto.user_id || null,
            },
        });
        return this.getTeacher(teacher.teacherId);
    }
    async updateTeacher(id, updateDto) {
        const teacher = await this.prisma.cramschoolTeacher.findUnique({
            where: { teacherId: id },
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Teacher with ID ${id} not found`);
        }
        await this.prisma.cramschoolTeacher.update({
            where: { teacherId: id },
            data: {
                name: updateDto.name,
                permissionLevel: updateDto.permission_level,
                phone: updateDto.phone,
                hireDate: updateDto.hire_date ? new Date(updateDto.hire_date) : undefined,
                userId: updateDto.user_id,
            },
        });
        return this.getTeacher(id);
    }
    async deleteTeacher(id) {
        const teacher = await this.prisma.cramschoolTeacher.findUnique({
            where: { teacherId: id },
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Teacher with ID ${id} not found`);
        }
        await this.prisma.cramschoolTeacher.delete({
            where: { teacherId: id },
        });
    }
    toTeacherDto(teacher) {
        return {
            teacher_id: teacher.teacherId,
            name: teacher.name,
            user_id: teacher.userId,
            permission_level: teacher.permissionLevel,
            phone: teacher.phone,
            hire_date: teacher.hireDate?.toISOString().split('T')[0] || null,
        };
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], TeachersService);


/***/ }),

/***/ "./src/cramschool/services/word-importer.service.ts":
/*!**********************************************************!*\
  !*** ./src/cramschool/services/word-importer.service.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WordImporterService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mammoth = __webpack_require__(/*! mammoth */ "mammoth");
let WordImporterService = class WordImporterService {
    constructor() {
        this.difficultyMap = {
            易: 1,
            簡單: 1,
            Easy: 1,
            中: 3,
            中等: 3,
            Medium: 3,
            難: 5,
            困難: 5,
            Hard: 5,
        };
    }
    async importQuestions(fileContent, filename, defaultSubjectId, defaultLevel, defaultChapter, saveImagesFunc) {
        const errors = [];
        const questions = [];
        try {
            if (!filename.endsWith('.docx') && !filename.endsWith('.doc')) {
                throw new common_1.BadRequestException('不支援的檔案格式，請上傳 .docx 或 .doc 檔案');
            }
            if (filename.endsWith('.docx')) {
                const result = await mammoth.extractRawText({ buffer: fileContent });
                const htmlResult = await mammoth.convertToHtml({ buffer: fileContent });
                const imageMap = {};
                if (saveImagesFunc) {
                    try {
                    }
                    catch (e) {
                    }
                }
                const parsed = this.parseDocxContent(result.value, htmlResult.value, imageMap);
                questions.push(...parsed.questions);
                errors.push(...parsed.errors);
            }
            else {
                throw new common_1.BadRequestException('.doc 格式需要額外的依賴，目前僅支援 .docx');
            }
            for (const q of questions) {
                if (!q.origin) {
                    q.origin = '';
                }
                if (!q.origin_detail) {
                    q.origin_detail = '';
                }
            }
            return { questions, errors };
        }
        catch (error) {
            errors.push(`解析檔案失敗：${error.message}`);
            return { questions, errors };
        }
    }
    parseDocxContent(rawText, htmlContent, imageMap) {
        const questions = [];
        const errors = [];
        const lines = rawText.split('\n').filter((line) => line.trim());
        let currentQuestion = null;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            const questionIdMatch = trimmed.match(/【題號】：\s*(\S+)/);
            const questionNumberMatch = trimmed.match(/^(\d+)[\.、\)）]/);
            if (questionIdMatch) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    question_number: undefined,
                    question_id: questionIdMatch[1],
                    difficulty: 3,
                    origin: '',
                    origin_detail: '',
                    content: '',
                    options: [],
                    answer: '',
                    explanation: '',
                };
                this.parseQuestionHeader(trimmed, currentQuestion);
                continue;
            }
            else if (questionNumberMatch) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    question_number: questionNumberMatch[1],
                    question_id: undefined,
                    difficulty: 3,
                    origin: '',
                    origin_detail: '',
                    content: '',
                    options: [],
                    answer: '',
                    explanation: '',
                };
                continue;
            }
            if (currentQuestion) {
                if (!currentQuestion.question_id) {
                    const qIdMatch = trimmed.match(/【題號】：\s*(\S+)/);
                    if (qIdMatch) {
                        currentQuestion.question_id = qIdMatch[1];
                        continue;
                    }
                }
                const difficultyMatch = trimmed.match(/【難易度】：\s*(\S+)/);
                if (difficultyMatch) {
                    const difficultyText = difficultyMatch[1];
                    currentQuestion.difficulty = this.difficultyMap[difficultyText] || 3;
                    continue;
                }
                const originMatch = trimmed.match(/【出處】：\s*(.+)/);
                if (originMatch) {
                    currentQuestion.origin = originMatch[1].trim();
                    continue;
                }
                const originDetailMatch = trimmed.match(/【題源】：\s*(.+)/);
                if (originDetailMatch) {
                    currentQuestion.origin_detail = originDetailMatch[1].trim();
                    continue;
                }
                const answerMatch = trimmed.match(/《答案》\s*([A-Z])/);
                if (answerMatch) {
                    currentQuestion.answer = answerMatch[1];
                    continue;
                }
                if (trimmed.includes('《解析》')) {
                    const explanationText = trimmed.replace(/《解析》\s*/, '');
                    if (explanationText) {
                        currentQuestion.explanation = explanationText;
                    }
                    continue;
                }
                const optionMatch = trimmed.match(/^\(([A-Z])\)/);
                if (optionMatch) {
                    const optionLetter = optionMatch[1];
                    const optionContent = trimmed.replace(/^\([A-Z]\)\s*/, '');
                    currentQuestion.options.push({
                        letter: optionLetter,
                        content: optionContent,
                    });
                    continue;
                }
                if (!currentQuestion.content) {
                    currentQuestion.content = trimmed;
                }
                else {
                    if (currentQuestion.options.length > 0) {
                        if (!currentQuestion.explanation) {
                            currentQuestion.explanation = trimmed;
                        }
                        else {
                            currentQuestion.explanation += '\n\n' + trimmed;
                        }
                    }
                    else {
                        currentQuestion.content += '\n' + trimmed;
                    }
                }
            }
        }
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        return { questions, errors };
    }
    parseQuestionHeader(line, question) {
        const difficultyMatch = line.match(/【難易度】：\s*(\S+)/);
        if (difficultyMatch) {
            const difficultyText = difficultyMatch[1];
            question.difficulty = this.difficultyMap[difficultyText] || 3;
        }
        const originMatch = line.match(/【出處】：\s*([^　]+)/);
        if (originMatch) {
            question.origin = originMatch[1].trim();
        }
        const originDetailMatch = line.match(/【題源】：\s*([^\*]+)/);
        if (originDetailMatch) {
            question.origin_detail = originDetailMatch[1].trim();
        }
    }
};
exports.WordImporterService = WordImporterService;
exports.WordImporterService = WordImporterService = __decorate([
    (0, common_1.Injectable)()
], WordImporterService);


/***/ }),

/***/ "./src/prisma/prisma.module.ts":
/*!*************************************!*\
  !*** ./src/prisma/prisma.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ./prisma.service */ "./src/prisma/prisma.service.ts");
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),

/***/ "./src/prisma/prisma.service.ts":
/*!**************************************!*\
  !*** ./src/prisma/prisma.service.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);


/***/ }),

/***/ "./src/types/request.types.ts":
/*!************************************!*\
  !*** ./src/types/request.types.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "@9jang/shared":
/*!********************************!*\
  !*** external "@9jang/shared" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@9jang/shared");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "mammoth":
/*!**************************!*\
  !*** external "mammoth" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("mammoth");

/***/ }),

/***/ "nestjs-zod":
/*!*****************************!*\
  !*** external "nestjs-zod" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("nestjs-zod");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("fs/promises");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.cjs":
/*!********************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.cjs ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.z = void 0;
const z = __importStar(__webpack_require__(/*! ./v3/external.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.cjs"));
exports.z = z;
__exportStar(__webpack_require__(/*! ./v3/external.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.cjs"), exports);
exports["default"] = z;


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.cjs":
/*!**************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.cjs ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZodError = exports.quotelessJson = exports.ZodIssueCode = void 0;
const util_js_1 = __webpack_require__(/*! ./helpers/util.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.cjs");
exports.ZodIssueCode = util_js_1.util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite",
]);
const quotelessJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
exports.quotelessJson = quotelessJson;
class ZodError extends Error {
    get errors() {
        return this.issues;
    }
    constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
            this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
            this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            // eslint-disable-next-line ban/ban
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    format(_mapper) {
        const mapper = _mapper ||
            function (issue) {
                return issue.message;
            };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
            for (const issue of error.issues) {
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                }
                else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                }
                else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                }
                else if (issue.path.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < issue.path.length) {
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || { _errors: [] };
                            // if (typeof el === "string") {
                            //   curr[el] = curr[el] || { _errors: [] };
                            // } else if (typeof el === "number") {
                            //   const errorArray: any = [];
                            //   errorArray._errors = [];
                            //   curr[el] = curr[el] || errorArray;
                            // }
                        }
                        else {
                            curr[el] = curr[el] || { _errors: [] };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    }
    static assert(value) {
        if (!(value instanceof ZodError)) {
            throw new Error(`Not a ZodError: ${value}`);
        }
    }
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, util_js_1.util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
            if (sub.path.length > 0) {
                const firstEl = sub.path[0];
                fieldErrors[firstEl] = fieldErrors[firstEl] || [];
                fieldErrors[firstEl].push(mapper(sub));
            }
            else {
                formErrors.push(mapper(sub));
            }
        }
        return { formErrors, fieldErrors };
    }
    get formErrors() {
        return this.flatten();
    }
}
exports.ZodError = ZodError;
ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
};


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.cjs":
/*!************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.cjs ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultErrorMap = void 0;
exports.setErrorMap = setErrorMap;
exports.getErrorMap = getErrorMap;
const en_js_1 = __importDefault(__webpack_require__(/*! ./locales/en.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.cjs"));
exports.defaultErrorMap = en_js_1.default;
let overrideErrorMap = en_js_1.default;
function setErrorMap(map) {
    overrideErrorMap = map;
}
function getErrorMap() {
    return overrideErrorMap;
}


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.cjs":
/*!**************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.cjs ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./errors.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.cjs"), exports);
__exportStar(__webpack_require__(/*! ./helpers/parseUtil.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.cjs"), exports);
__exportStar(__webpack_require__(/*! ./helpers/typeAliases.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/typeAliases.cjs"), exports);
__exportStar(__webpack_require__(/*! ./helpers/util.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.cjs"), exports);
__exportStar(__webpack_require__(/*! ./types.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.cjs"), exports);
__exportStar(__webpack_require__(/*! ./ZodError.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.cjs"), exports);


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.cjs":
/*!***********************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.cjs ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorUtil = void 0;
var errorUtil;
(function (errorUtil) {
    errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    // biome-ignore lint:
    errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (exports.errorUtil = errorUtil = {}));


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.cjs":
/*!***********************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.cjs ***!
  \***********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isAsync = exports.isValid = exports.isDirty = exports.isAborted = exports.OK = exports.DIRTY = exports.INVALID = exports.ParseStatus = exports.EMPTY_PATH = exports.makeIssue = void 0;
exports.addIssueToContext = addIssueToContext;
const errors_js_1 = __webpack_require__(/*! ../errors.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.cjs");
const en_js_1 = __importDefault(__webpack_require__(/*! ../locales/en.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.cjs"));
const makeIssue = (params) => {
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...(issueData.path || [])];
    const fullIssue = {
        ...issueData,
        path: fullPath,
    };
    if (issueData.message !== undefined) {
        return {
            ...issueData,
            path: fullPath,
            message: issueData.message,
        };
    }
    let errorMessage = "";
    const maps = errorMaps
        .filter((m) => !!m)
        .slice()
        .reverse();
    for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: errorMessage,
    };
};
exports.makeIssue = makeIssue;
exports.EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
    const overrideMap = (0, errors_js_1.getErrorMap)();
    const issue = (0, exports.makeIssue)({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.common.contextualErrorMap, // contextual error map is first priority
            ctx.schemaErrorMap, // then schema-bound map if available
            overrideMap, // then global override map
            overrideMap === en_js_1.default ? undefined : en_js_1.default, // then global default map
        ].filter((x) => !!x),
    });
    ctx.common.issues.push(issue);
}
class ParseStatus {
    constructor() {
        this.value = "valid";
    }
    dirty() {
        if (this.value === "valid")
            this.value = "dirty";
    }
    abort() {
        if (this.value !== "aborted")
            this.value = "aborted";
    }
    static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
            if (s.status === "aborted")
                return exports.INVALID;
            if (s.status === "dirty")
                status.dirty();
            arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            syncPairs.push({
                key,
                value,
            });
        }
        return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
            const { key, value } = pair;
            if (key.status === "aborted")
                return exports.INVALID;
            if (value.status === "aborted")
                return exports.INVALID;
            if (key.status === "dirty")
                status.dirty();
            if (value.status === "dirty")
                status.dirty();
            if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
                finalObject[key.value] = value.value;
            }
        }
        return { status: status.value, value: finalObject };
    }
}
exports.ParseStatus = ParseStatus;
exports.INVALID = Object.freeze({
    status: "aborted",
});
const DIRTY = (value) => ({ status: "dirty", value });
exports.DIRTY = DIRTY;
const OK = (value) => ({ status: "valid", value });
exports.OK = OK;
const isAborted = (x) => x.status === "aborted";
exports.isAborted = isAborted;
const isDirty = (x) => x.status === "dirty";
exports.isDirty = isDirty;
const isValid = (x) => x.status === "valid";
exports.isValid = isValid;
const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
exports.isAsync = isAsync;


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/typeAliases.cjs":
/*!*************************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/typeAliases.cjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.cjs":
/*!******************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.cjs ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getParsedType = exports.ZodParsedType = exports.objectUtil = exports.util = void 0;
var util;
(function (util) {
    util.assertEqual = (_) => { };
    function assertIs(_arg) { }
    util.assertIs = assertIs;
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj) => {
        const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
            filtered[k] = obj[k];
        }
        return util.objectValues(filtered);
    };
    util.objectValues = (obj) => {
        return util.objectKeys(obj).map(function (e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
        ? (obj) => Object.keys(obj) // eslint-disable-line ban/ban
        : (object) => {
            const keys = [];
            for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    util.find = (arr, checker) => {
        for (const item of arr) {
            if (checker(item))
                return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function"
        ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
        : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
        return array.map((val) => (typeof val === "string" ? `'${val}'` : val)).join(separator);
    }
    util.joinValues = joinValues;
    util.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    };
})(util || (exports.util = util = {}));
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = (first, second) => {
        return {
            ...first,
            ...second, // second overwrites first
        };
    };
})(objectUtil || (exports.objectUtil = objectUtil = {}));
exports.ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);
const getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
        case "undefined":
            return exports.ZodParsedType.undefined;
        case "string":
            return exports.ZodParsedType.string;
        case "number":
            return Number.isNaN(data) ? exports.ZodParsedType.nan : exports.ZodParsedType.number;
        case "boolean":
            return exports.ZodParsedType.boolean;
        case "function":
            return exports.ZodParsedType.function;
        case "bigint":
            return exports.ZodParsedType.bigint;
        case "symbol":
            return exports.ZodParsedType.symbol;
        case "object":
            if (Array.isArray(data)) {
                return exports.ZodParsedType.array;
            }
            if (data === null) {
                return exports.ZodParsedType.null;
            }
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                return exports.ZodParsedType.promise;
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return exports.ZodParsedType.map;
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return exports.ZodParsedType.set;
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return exports.ZodParsedType.date;
            }
            return exports.ZodParsedType.object;
        default:
            return exports.ZodParsedType.unknown;
    }
};
exports.getParsedType = getParsedType;


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.cjs":
/*!****************************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.cjs ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const ZodError_js_1 = __webpack_require__(/*! ../ZodError.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.cjs");
const util_js_1 = __webpack_require__(/*! ../helpers/util.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.cjs");
const errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
        case ZodError_js_1.ZodIssueCode.invalid_type:
            if (issue.received === util_js_1.ZodParsedType.undefined) {
                message = "Required";
            }
            else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case ZodError_js_1.ZodIssueCode.invalid_literal:
            message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_js_1.util.jsonStringifyReplacer)}`;
            break;
        case ZodError_js_1.ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${util_js_1.util.joinValues(issue.keys, ", ")}`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_union_discriminator:
            message = `Invalid discriminator value. Expected ${util_js_1.util.joinValues(issue.options)}`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_enum_value:
            message = `Invalid enum value. Expected ${util_js_1.util.joinValues(issue.options)}, received '${issue.received}'`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_string:
            if (typeof issue.validation === "object") {
                if ("includes" in issue.validation) {
                    message = `Invalid input: must include "${issue.validation.includes}"`;
                    if (typeof issue.validation.position === "number") {
                        message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                    }
                }
                else if ("startsWith" in issue.validation) {
                    message = `Invalid input: must start with "${issue.validation.startsWith}"`;
                }
                else if ("endsWith" in issue.validation) {
                    message = `Invalid input: must end with "${issue.validation.endsWith}"`;
                }
                else {
                    util_js_1.util.assertNever(issue.validation);
                }
            }
            else if (issue.validation !== "regex") {
                message = `Invalid ${issue.validation}`;
            }
            else {
                message = "Invalid";
            }
            break;
        case ZodError_js_1.ZodIssueCode.too_small:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
            else if (issue.type === "bigint")
                message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
            else
                message = "Invalid input";
            break;
        case ZodError_js_1.ZodIssueCode.too_big:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "bigint")
                message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
            else
                message = "Invalid input";
            break;
        case ZodError_js_1.ZodIssueCode.custom:
            message = `Invalid input`;
            break;
        case ZodError_js_1.ZodIssueCode.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case ZodError_js_1.ZodIssueCode.not_multiple_of:
            message = `Number must be a multiple of ${issue.multipleOf}`;
            break;
        case ZodError_js_1.ZodIssueCode.not_finite:
            message = "Number must be finite";
            break;
        default:
            message = _ctx.defaultError;
            util_js_1.util.assertNever(issue);
    }
    return { message };
};
exports["default"] = errorMap;


/***/ }),

/***/ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.cjs":
/*!***********************************************************************!*\
  !*** ../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.cjs ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.discriminatedUnion = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = exports.coerce = exports.ZodFirstPartyTypeKind = exports.late = exports.ZodSchema = exports.Schema = exports.ZodReadonly = exports.ZodPipeline = exports.ZodBranded = exports.BRAND = exports.ZodNaN = exports.ZodCatch = exports.ZodDefault = exports.ZodNullable = exports.ZodOptional = exports.ZodTransformer = exports.ZodEffects = exports.ZodPromise = exports.ZodNativeEnum = exports.ZodEnum = exports.ZodLiteral = exports.ZodLazy = exports.ZodFunction = exports.ZodSet = exports.ZodMap = exports.ZodRecord = exports.ZodTuple = exports.ZodIntersection = exports.ZodDiscriminatedUnion = exports.ZodUnion = exports.ZodObject = exports.ZodArray = exports.ZodVoid = exports.ZodNever = exports.ZodUnknown = exports.ZodAny = exports.ZodNull = exports.ZodUndefined = exports.ZodSymbol = exports.ZodDate = exports.ZodBoolean = exports.ZodBigInt = exports.ZodNumber = exports.ZodString = exports.ZodType = void 0;
exports.NEVER = exports["void"] = exports.unknown = exports.union = exports.undefined = exports.tuple = exports.transformer = exports.symbol = exports.string = exports.strictObject = exports.set = exports.record = exports.promise = exports.preprocess = exports.pipeline = exports.ostring = exports.optional = exports.onumber = exports.oboolean = exports.object = exports.number = exports.nullable = exports["null"] = exports.never = exports.nativeEnum = exports.nan = exports.map = exports.literal = exports.lazy = exports.intersection = exports["instanceof"] = exports["function"] = exports["enum"] = exports.effect = void 0;
exports.datetimeRegex = datetimeRegex;
exports.custom = custom;
const ZodError_js_1 = __webpack_require__(/*! ./ZodError.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.cjs");
const errors_js_1 = __webpack_require__(/*! ./errors.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.cjs");
const errorUtil_js_1 = __webpack_require__(/*! ./helpers/errorUtil.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.cjs");
const parseUtil_js_1 = __webpack_require__(/*! ./helpers/parseUtil.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.cjs");
const util_js_1 = __webpack_require__(/*! ./helpers/util.cjs */ "../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.cjs");
class ParseInputLazyPath {
    constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
    }
    get path() {
        if (!this._cachedPath.length) {
            if (Array.isArray(this._key)) {
                this._cachedPath.push(...this._path, ...this._key);
            }
            else {
                this._cachedPath.push(...this._path, this._key);
            }
        }
        return this._cachedPath;
    }
}
const handleResult = (ctx, result) => {
    if ((0, parseUtil_js_1.isValid)(result)) {
        return { success: true, data: result.value };
    }
    else {
        if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        return {
            success: false,
            get error() {
                if (this._error)
                    return this._error;
                const error = new ZodError_js_1.ZodError(ctx.common.issues);
                this._error = error;
                return this._error;
            },
        };
    }
};
function processCreateParams(params) {
    if (!params)
        return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap)
        return { errorMap: errorMap, description };
    const customMap = (iss, ctx) => {
        const { message } = params;
        if (iss.code === "invalid_enum_value") {
            return { message: message ?? ctx.defaultError };
        }
        if (typeof ctx.data === "undefined") {
            return { message: message ?? required_error ?? ctx.defaultError };
        }
        if (iss.code !== "invalid_type")
            return { message: ctx.defaultError };
        return { message: message ?? invalid_type_error ?? ctx.defaultError };
    };
    return { errorMap: customMap, description };
}
class ZodType {
    get description() {
        return this._def.description;
    }
    _getType(input) {
        return (0, util_js_1.getParsedType)(input.data);
    }
    _getOrReturnCtx(input, ctx) {
        return (ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: (0, util_js_1.getParsedType)(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent,
        });
    }
    _processInputParams(input) {
        return {
            status: new parseUtil_js_1.ParseStatus(),
            ctx: {
                common: input.parent.common,
                data: input.data,
                parsedType: (0, util_js_1.getParsedType)(input.data),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent,
            },
        };
    }
    _parseSync(input) {
        const result = this._parse(input);
        if ((0, parseUtil_js_1.isAsync)(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        const ctx = {
            common: {
                issues: [],
                async: params?.async ?? false,
                contextualErrorMap: params?.errorMap,
            },
            path: params?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0, util_js_1.getParsedType)(data),
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
    }
    "~validate"(data) {
        const ctx = {
            common: {
                issues: [],
                async: !!this["~standard"].async,
            },
            path: [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0, util_js_1.getParsedType)(data),
        };
        if (!this["~standard"].async) {
            try {
                const result = this._parseSync({ data, path: [], parent: ctx });
                return (0, parseUtil_js_1.isValid)(result)
                    ? {
                        value: result.value,
                    }
                    : {
                        issues: ctx.common.issues,
                    };
            }
            catch (err) {
                if (err?.message?.toLowerCase()?.includes("encountered")) {
                    this["~standard"].async = true;
                }
                ctx.common = {
                    issues: [],
                    async: true,
                };
            }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => (0, parseUtil_js_1.isValid)(result)
            ? {
                value: result.value,
            }
            : {
                issues: ctx.common.issues,
            });
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = {
            common: {
                issues: [],
                contextualErrorMap: params?.errorMap,
                async: true,
            },
            path: params?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0, util_js_1.getParsedType)(data),
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await ((0, parseUtil_js_1.isAsync)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    refine(check, message) {
        const getIssueProperties = (val) => {
            if (typeof message === "string" || typeof message === "undefined") {
                return { message };
            }
            else if (typeof message === "function") {
                return message(val);
            }
            else {
                return message;
            }
        };
        return this._refinement((val, ctx) => {
            const result = check(val);
            const setError = () => ctx.addIssue({
                code: ZodError_js_1.ZodIssueCode.custom,
                ...getIssueProperties(val),
            });
            if (typeof Promise !== "undefined" && result instanceof Promise) {
                return result.then((data) => {
                    if (!data) {
                        setError();
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            }
            else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
                return false;
            }
            else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "refinement", refinement },
        });
    }
    superRefine(refinement) {
        return this._refinement(refinement);
    }
    constructor(def) {
        /** Alias of safeParseAsync */
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
            version: 1,
            vendor: "zod",
            validate: (data) => this["~validate"](data),
        };
    }
    optional() {
        return ZodOptional.create(this, this._def);
    }
    nullable() {
        return ZodNullable.create(this, this._def);
    }
    nullish() {
        return this.nullable().optional();
    }
    array() {
        return ZodArray.create(this);
    }
    promise() {
        return ZodPromise.create(this, this._def);
    }
    or(option) {
        return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
        return new ZodEffects({
            ...processCreateParams(this._def),
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "transform", transform },
        });
    }
    default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
            ...processCreateParams(this._def),
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
        });
    }
    brand() {
        return new ZodBranded({
            typeName: ZodFirstPartyTypeKind.ZodBranded,
            type: this,
            ...processCreateParams(this._def),
        });
    }
    catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
            ...processCreateParams(this._def),
            innerType: this,
            catchValue: catchValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodCatch,
        });
    }
    describe(description) {
        const This = this.constructor;
        return new This({
            ...this._def,
            description,
        });
    }
    pipe(target) {
        return ZodPipeline.create(this, target);
    }
    readonly() {
        return ZodReadonly.create(this);
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
exports.ZodType = ZodType;
exports.Schema = ZodType;
exports.ZodSchema = ZodType;
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[0-9a-z]+$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
// const uuidRegex =
//   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
const nanoidRegex = /^[a-z0-9_-]{21}$/i;
const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
//old email regex
// const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
// eslint-disable-next-line
// const emailRegex =
//   /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
// const emailRegex =
//   /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// const emailRegex =
//   /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
// const emailRegex =
//   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex;
// faster, simpler, safer
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
// const ipv6Regex =
// /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
// https://base64.guru/standards/base64url
const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
// simple
// const dateRegexSource = `\\d{4}-\\d{2}-\\d{2}`;
// no leap year validation
// const dateRegexSource = `\\d{4}-((0[13578]|10|12)-31|(0[13-9]|1[0-2])-30|(0[1-9]|1[0-2])-(0[1-9]|1\\d|2\\d))`;
// with leap year validation
const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
    let secondsRegexSource = `[0-5]\\d`;
    if (args.precision) {
        secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
    }
    else if (args.precision == null) {
        secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
    }
    const secondsQuantifier = args.precision ? "+" : "?"; // require seconds if precision is nonzero
    return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
    return new RegExp(`^${timeRegexSource(args)}$`);
}
// Adapted from https://stackoverflow.com/a/3143231
function datetimeRegex(args) {
    let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
    const opts = [];
    opts.push(args.local ? `Z?` : `Z`);
    if (args.offset)
        opts.push(`([+-]\\d{2}:?\\d{2})`);
    regex = `${regex}(${opts.join("|")})`;
    return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
    }
    return false;
}
function isValidJWT(jwt, alg) {
    if (!jwtRegex.test(jwt))
        return false;
    try {
        const [header] = jwt.split(".");
        if (!header)
            return false;
        // Convert base64url to base64
        const base64 = header
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(header.length + ((4 - (header.length % 4)) % 4), "=");
        const decoded = JSON.parse(atob(base64));
        if (typeof decoded !== "object" || decoded === null)
            return false;
        if ("typ" in decoded && decoded?.typ !== "JWT")
            return false;
        if (!decoded.alg)
            return false;
        if (alg && decoded.alg !== alg)
            return false;
        return true;
    }
    catch {
        return false;
    }
}
function isValidCidr(ip, version) {
    if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
        return true;
    }
    return false;
}
class ZodString extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.string) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.string,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.length < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.length > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "length") {
                const tooBig = input.data.length > check.value;
                const tooSmall = input.data.length < check.value;
                if (tooBig || tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    if (tooBig) {
                        (0, parseUtil_js_1.addIssueToContext)(ctx, {
                            code: ZodError_js_1.ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    else if (tooSmall) {
                        (0, parseUtil_js_1.addIssueToContext)(ctx, {
                            code: ZodError_js_1.ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    status.dirty();
                }
            }
            else if (check.kind === "email") {
                if (!emailRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "email",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "emoji") {
                if (!emojiRegex) {
                    emojiRegex = new RegExp(_emojiRegex, "u");
                }
                if (!emojiRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "emoji",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "uuid") {
                if (!uuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "uuid",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "nanoid") {
                if (!nanoidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "nanoid",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid") {
                if (!cuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "cuid",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid2") {
                if (!cuid2Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "cuid2",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ulid") {
                if (!ulidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "ulid",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "url") {
                try {
                    new URL(input.data);
                }
                catch {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "url",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "regex") {
                check.regex.lastIndex = 0;
                const testResult = check.regex.test(input.data);
                if (!testResult) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "regex",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "trim") {
                input.data = input.data.trim();
            }
            else if (check.kind === "includes") {
                if (!input.data.includes(check.value, check.position)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        validation: { includes: check.value, position: check.position },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "toLowerCase") {
                input.data = input.data.toLowerCase();
            }
            else if (check.kind === "toUpperCase") {
                input.data = input.data.toUpperCase();
            }
            else if (check.kind === "startsWith") {
                if (!input.data.startsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        validation: { startsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "endsWith") {
                if (!input.data.endsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        validation: { endsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "datetime") {
                const regex = datetimeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        validation: "datetime",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "date") {
                const regex = dateRegex;
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        validation: "date",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "time") {
                const regex = timeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        validation: "time",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "duration") {
                if (!durationRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "duration",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ip") {
                if (!isValidIP(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "ip",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "jwt") {
                if (!isValidJWT(input.data, check.alg)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "jwt",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cidr") {
                if (!isValidCidr(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "cidr",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "base64") {
                if (!base64Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "base64",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "base64url") {
                if (!base64urlRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        validation: "base64url",
                        code: ZodError_js_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util_js_1.util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
            validation,
            code: ZodError_js_1.ZodIssueCode.invalid_string,
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    _addCheck(check) {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    email(message) {
        return this._addCheck({ kind: "email", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    url(message) {
        return this._addCheck({ kind: "url", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    base64url(message) {
        // base64url encoding is a modification of base64 that can safely be used in URLs and filenames
        return this._addCheck({
            kind: "base64url",
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil_js_1.errorUtil.errToObj(options) });
    }
    ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil_js_1.errorUtil.errToObj(options) });
    }
    cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil_js_1.errorUtil.errToObj(options) });
    }
    datetime(options) {
        if (typeof options === "string") {
            return this._addCheck({
                kind: "datetime",
                precision: null,
                offset: false,
                local: false,
                message: options,
            });
        }
        return this._addCheck({
            kind: "datetime",
            precision: typeof options?.precision === "undefined" ? null : options?.precision,
            offset: options?.offset ?? false,
            local: options?.local ?? false,
            ...errorUtil_js_1.errorUtil.errToObj(options?.message),
        });
    }
    date(message) {
        return this._addCheck({ kind: "date", message });
    }
    time(options) {
        if (typeof options === "string") {
            return this._addCheck({
                kind: "time",
                precision: null,
                message: options,
            });
        }
        return this._addCheck({
            kind: "time",
            precision: typeof options?.precision === "undefined" ? null : options?.precision,
            ...errorUtil_js_1.errorUtil.errToObj(options?.message),
        });
    }
    duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil_js_1.errorUtil.errToObj(message) });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    includes(value, options) {
        return this._addCheck({
            kind: "includes",
            value: value,
            position: options?.position,
            ...errorUtil_js_1.errorUtil.errToObj(options?.message),
        });
    }
    startsWith(value, message) {
        return this._addCheck({
            kind: "startsWith",
            value: value,
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    endsWith(value, message) {
        return this._addCheck({
            kind: "endsWith",
            value: value,
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    length(len, message) {
        return this._addCheck({
            kind: "length",
            value: len,
            ...errorUtil_js_1.errorUtil.errToObj(message),
        });
    }
    /**
     * Equivalent to `.min(1)`
     */
    nonempty(message) {
        return this.min(1, errorUtil_js_1.errorUtil.errToObj(message));
    }
    trim() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "trim" }],
        });
    }
    toLowerCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toLowerCase" }],
        });
    }
    toUpperCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toUpperCase" }],
        });
    }
    get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
    }
    get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
    }
    get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
    }
    get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
    }
    get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
    }
    get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
    }
    get isBase64url() {
        // base64url encoding is a modification of base64 that can safely be used in URLs and filenames
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
    }
    get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
exports.ZodString = ZodString;
ZodString.create = (params) => {
    return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params),
    });
};
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
    return (valInt % stepInt) / 10 ** decCount;
}
class ZodNumber extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.number) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.number,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        let ctx = undefined;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "int") {
                if (!util_js_1.util.isInteger(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "min") {
                const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (floatSafeRemainder(input.data, check.value) !== 0) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "finite") {
                if (!Number.isFinite(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.not_finite,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util_js_1.util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil_js_1.errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodNumber({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    finite(message) {
        return this._addCheck({
            kind: "finite",
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    safe(message) {
        return this._addCheck({
            kind: "min",
            inclusive: true,
            value: Number.MIN_SAFE_INTEGER,
            message: errorUtil_js_1.errorUtil.toString(message),
        })._addCheck({
            kind: "max",
            inclusive: true,
            value: Number.MAX_SAFE_INTEGER,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || (ch.kind === "multipleOf" && util_js_1.util.isInteger(ch.value)));
    }
    get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
                return true;
            }
            else if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
            else if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return Number.isFinite(min) && Number.isFinite(max);
    }
}
exports.ZodNumber = ZodNumber;
ZodNumber.create = (params) => {
    return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params),
    });
};
class ZodBigInt extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
    }
    _parse(input) {
        if (this._def.coerce) {
            try {
                input.data = BigInt(input.data);
            }
            catch {
                return this._getInvalidInput(input);
            }
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.bigint) {
            return this._getInvalidInput(input);
        }
        let ctx = undefined;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_small,
                        type: "bigint",
                        minimum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_big,
                        type: "bigint",
                        maximum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (input.data % check.value !== BigInt(0)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util_js_1.util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.bigint,
            received: ctx.parsedType,
        });
        return parseUtil_js_1.INVALID;
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodBigInt({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil_js_1.errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodBigInt({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
exports.ZodBigInt = ZodBigInt;
ZodBigInt.create = (params) => {
    return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params),
    });
};
class ZodBoolean extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.boolean) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.boolean,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
    }
}
exports.ZodBoolean = ZodBoolean;
ZodBoolean.create = (params) => {
    return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params),
    });
};
class ZodDate extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.date) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.date,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_date,
            });
            return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.getTime() < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_small,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        minimum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.getTime() > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.too_big,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        maximum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else {
                util_js_1.util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: new Date(input.data.getTime()),
        };
    }
    _addCheck(check) {
        return new ZodDate({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    min(minDate, message) {
        return this._addCheck({
            kind: "min",
            value: minDate.getTime(),
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    max(maxDate, message) {
        return this._addCheck({
            kind: "max",
            value: maxDate.getTime(),
            message: errorUtil_js_1.errorUtil.toString(message),
        });
    }
    get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min != null ? new Date(min) : null;
    }
    get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max != null ? new Date(max) : null;
    }
}
exports.ZodDate = ZodDate;
ZodDate.create = (params) => {
    return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params),
    });
};
class ZodSymbol extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.symbol) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.symbol,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
    }
}
exports.ZodSymbol = ZodSymbol;
ZodSymbol.create = (params) => {
    return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params),
    });
};
class ZodUndefined extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.undefined,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
    }
}
exports.ZodUndefined = ZodUndefined;
ZodUndefined.create = (params) => {
    return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params),
    });
};
class ZodNull extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.null) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.null,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
    }
}
exports.ZodNull = ZodNull;
ZodNull.create = (params) => {
    return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params),
    });
};
class ZodAny extends ZodType {
    constructor() {
        super(...arguments);
        // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
        this._any = true;
    }
    _parse(input) {
        return (0, parseUtil_js_1.OK)(input.data);
    }
}
exports.ZodAny = ZodAny;
ZodAny.create = (params) => {
    return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params),
    });
};
class ZodUnknown extends ZodType {
    constructor() {
        super(...arguments);
        // required
        this._unknown = true;
    }
    _parse(input) {
        return (0, parseUtil_js_1.OK)(input.data);
    }
}
exports.ZodUnknown = ZodUnknown;
ZodUnknown.create = (params) => {
    return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params),
    });
};
class ZodNever extends ZodType {
    _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.never,
            received: ctx.parsedType,
        });
        return parseUtil_js_1.INVALID;
    }
}
exports.ZodNever = ZodNever;
ZodNever.create = (params) => {
    return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params),
    });
};
class ZodVoid extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.void,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
    }
}
exports.ZodVoid = ZodVoid;
ZodVoid.create = (params) => {
    return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params),
    });
};
class ZodArray extends ZodType {
    _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.array,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        if (def.exactLength !== null) {
            const tooBig = ctx.data.length > def.exactLength.value;
            const tooSmall = ctx.data.length < def.exactLength.value;
            if (tooBig || tooSmall) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                    code: tooBig ? ZodError_js_1.ZodIssueCode.too_big : ZodError_js_1.ZodIssueCode.too_small,
                    minimum: (tooSmall ? def.exactLength.value : undefined),
                    maximum: (tooBig ? def.exactLength.value : undefined),
                    type: "array",
                    inclusive: true,
                    exact: true,
                    message: def.exactLength.message,
                });
                status.dirty();
            }
        }
        if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                    code: ZodError_js_1.ZodIssueCode.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.minLength.message,
                });
                status.dirty();
            }
        }
        if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                    code: ZodError_js_1.ZodIssueCode.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.maxLength.message,
                });
                status.dirty();
            }
        }
        if (ctx.common.async) {
            return Promise.all([...ctx.data].map((item, i) => {
                return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
            })).then((result) => {
                return parseUtil_js_1.ParseStatus.mergeArray(status, result);
            });
        }
        const result = [...ctx.data].map((item, i) => {
            return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return parseUtil_js_1.ParseStatus.mergeArray(status, result);
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray({
            ...this._def,
            minLength: { value: minLength, message: errorUtil_js_1.errorUtil.toString(message) },
        });
    }
    max(maxLength, message) {
        return new ZodArray({
            ...this._def,
            maxLength: { value: maxLength, message: errorUtil_js_1.errorUtil.toString(message) },
        });
    }
    length(len, message) {
        return new ZodArray({
            ...this._def,
            exactLength: { value: len, message: errorUtil_js_1.errorUtil.toString(message) },
        });
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
exports.ZodArray = ZodArray;
ZodArray.create = (schema, params) => {
    return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params),
    });
};
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
            ...schema._def,
            shape: () => newShape,
        });
    }
    else if (schema instanceof ZodArray) {
        return new ZodArray({
            ...schema._def,
            type: deepPartialify(schema.element),
        });
    }
    else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    }
    else {
        return schema;
    }
}
class ZodObject extends ZodType {
    constructor() {
        super(...arguments);
        this._cached = null;
        /**
         * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
         * If you want to pass through unknown properties, use `.passthrough()` instead.
         */
        this.nonstrict = this.passthrough;
        // extend<
        //   Augmentation extends ZodRawShape,
        //   NewOutput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
        //       ? Augmentation[k]["_output"]
        //       : k extends keyof Output
        //       ? Output[k]
        //       : never;
        //   }>,
        //   NewInput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
        //       ? Augmentation[k]["_input"]
        //       : k extends keyof Input
        //       ? Input[k]
        //       : never;
        //   }>
        // >(
        //   augmentation: Augmentation
        // ): ZodObject<
        //   extendShape<T, Augmentation>,
        //   UnknownKeys,
        //   Catchall,
        //   NewOutput,
        //   NewInput
        // > {
        //   return new ZodObject({
        //     ...this._def,
        //     shape: () => ({
        //       ...this._def.shape(),
        //       ...augmentation,
        //     }),
        //   }) as any;
        // }
        /**
         * @deprecated Use `.extend` instead
         *  */
        this.augment = this.extend;
    }
    _getCached() {
        if (this._cached !== null)
            return this._cached;
        const shape = this._def.shape();
        const keys = util_js_1.util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
    }
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.object) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
            for (const key in ctx.data) {
                if (!shapeKeys.includes(key)) {
                    extraKeys.push(key);
                }
            }
        }
        const pairs = [];
        for (const key of shapeKeys) {
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
                key: { status: "valid", value: key },
                value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                for (const key of extraKeys) {
                    pairs.push({
                        key: { status: "valid", value: key },
                        value: { status: "valid", value: ctx.data[key] },
                    });
                }
            }
            else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    (0, parseUtil_js_1.addIssueToContext)(ctx, {
                        code: ZodError_js_1.ZodIssueCode.unrecognized_keys,
                        keys: extraKeys,
                    });
                    status.dirty();
                }
            }
            else if (unknownKeys === "strip") {
            }
            else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        }
        else {
            // run catchall validation
            const catchall = this._def.catchall;
            for (const key of extraKeys) {
                const value = ctx.data[key];
                pairs.push({
                    key: { status: "valid", value: key },
                    value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key) //, ctx.child(key), value, getParsedType(value)
                    ),
                    alwaysSet: key in ctx.data,
                });
            }
        }
        if (ctx.common.async) {
            return Promise.resolve()
                .then(async () => {
                const syncPairs = [];
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    syncPairs.push({
                        key,
                        value,
                        alwaysSet: pair.alwaysSet,
                    });
                }
                return syncPairs;
            })
                .then((syncPairs) => {
                return parseUtil_js_1.ParseStatus.mergeObjectSync(status, syncPairs);
            });
        }
        else {
            return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict(message) {
        errorUtil_js_1.errorUtil.errToObj;
        return new ZodObject({
            ...this._def,
            unknownKeys: "strict",
            ...(message !== undefined
                ? {
                    errorMap: (issue, ctx) => {
                        const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
                        if (issue.code === "unrecognized_keys")
                            return {
                                message: errorUtil_js_1.errorUtil.errToObj(message).message ?? defaultError,
                            };
                        return {
                            message: defaultError,
                        };
                    },
                }
                : {}),
        });
    }
    strip() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strip",
        });
    }
    passthrough() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "passthrough",
        });
    }
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
        return new ZodObject({
            ...this._def,
            shape: () => ({
                ...this._def.shape(),
                ...augmentation,
            }),
        });
    }
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge(merging) {
        const merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: () => ({
                ...this._def.shape(),
                ...merging._def.shape(),
            }),
            typeName: ZodFirstPartyTypeKind.ZodObject,
        });
        return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
        return this.augment({ [key]: schema });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
        return new ZodObject({
            ...this._def,
            catchall: index,
        });
    }
    pick(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(mask)) {
            if (mask[key] && this.shape[key]) {
                shape[key] = this.shape[key];
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    omit(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
            if (!mask[key]) {
                shape[key] = this.shape[key];
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    /**
     * @deprecated
     */
    deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
            const fieldSchema = this.shape[key];
            if (mask && !mask[key]) {
                newShape[key] = fieldSchema;
            }
            else {
                newShape[key] = fieldSchema.optional();
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    required(mask) {
        const newShape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
            if (mask && !mask[key]) {
                newShape[key] = this.shape[key];
            }
            else {
                const fieldSchema = this.shape[key];
                let newField = fieldSchema;
                while (newField instanceof ZodOptional) {
                    newField = newField._def.innerType;
                }
                newShape[key] = newField;
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    keyof() {
        return createZodEnum(util_js_1.util.objectKeys(this.shape));
    }
}
exports.ZodObject = ZodObject;
ZodObject.create = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
class ZodUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
            // return first issue-free validation if it exists
            for (const result of results) {
                if (result.result.status === "valid") {
                    return result.result;
                }
            }
            for (const result of results) {
                if (result.result.status === "dirty") {
                    // add issues from dirty option
                    ctx.common.issues.push(...result.ctx.common.issues);
                    return result.result;
                }
            }
            // return invalid
            const unionErrors = results.map((result) => new ZodError_js_1.ZodError(result.ctx.common.issues));
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_union,
                unionErrors,
            });
            return parseUtil_js_1.INVALID;
        }
        if (ctx.common.async) {
            return Promise.all(options.map(async (option) => {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                return {
                    result: await option._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx,
                    }),
                    ctx: childCtx,
                };
            })).then(handleResults);
        }
        else {
            let dirty = undefined;
            const issues = [];
            for (const option of options) {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                const result = option._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: childCtx,
                });
                if (result.status === "valid") {
                    return result;
                }
                else if (result.status === "dirty" && !dirty) {
                    dirty = { result, ctx: childCtx };
                }
                if (childCtx.common.issues.length) {
                    issues.push(childCtx.common.issues);
                }
            }
            if (dirty) {
                ctx.common.issues.push(...dirty.ctx.common.issues);
                return dirty.result;
            }
            const unionErrors = issues.map((issues) => new ZodError_js_1.ZodError(issues));
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_union,
                unionErrors,
            });
            return parseUtil_js_1.INVALID;
        }
    }
    get options() {
        return this._def.options;
    }
}
exports.ZodUnion = ZodUnion;
ZodUnion.create = (types, params) => {
    return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params),
    });
};
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
const getDiscriminator = (type) => {
    if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
    }
    else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
    }
    else if (type instanceof ZodLiteral) {
        return [type.value];
    }
    else if (type instanceof ZodEnum) {
        return type.options;
    }
    else if (type instanceof ZodNativeEnum) {
        // eslint-disable-next-line ban/ban
        return util_js_1.util.objectValues(type.enum);
    }
    else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
    }
    else if (type instanceof ZodUndefined) {
        return [undefined];
    }
    else if (type instanceof ZodNull) {
        return [null];
    }
    else if (type instanceof ZodOptional) {
        return [undefined, ...getDiscriminator(type.unwrap())];
    }
    else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
    }
    else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
    }
    else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
    }
    else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
    }
    else {
        return [];
    }
};
class ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_union_discriminator,
                options: Array.from(this.optionsMap.keys()),
                path: [discriminator],
            });
            return parseUtil_js_1.INVALID;
        }
        if (ctx.common.async) {
            return option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
        else {
            return option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
    }
    get discriminator() {
        return this._def.discriminator;
    }
    get options() {
        return this._def.options;
    }
    get optionsMap() {
        return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    static create(discriminator, options, params) {
        // Get all the valid discriminator values
        const optionsMap = new Map();
        // try {
        for (const type of options) {
            const discriminatorValues = getDiscriminator(type.shape[discriminator]);
            if (!discriminatorValues.length) {
                throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
            }
            for (const value of discriminatorValues) {
                if (optionsMap.has(value)) {
                    throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
                }
                optionsMap.set(value, type);
            }
        }
        return new ZodDiscriminatedUnion({
            typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
            discriminator,
            options,
            optionsMap,
            ...processCreateParams(params),
        });
    }
}
exports.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
function mergeValues(a, b) {
    const aType = (0, util_js_1.getParsedType)(a);
    const bType = (0, util_js_1.getParsedType)(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    else if (aType === util_js_1.ZodParsedType.object && bType === util_js_1.ZodParsedType.object) {
        const bKeys = util_js_1.util.objectKeys(b);
        const sharedKeys = util_js_1.util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    else if (aType === util_js_1.ZodParsedType.array && bType === util_js_1.ZodParsedType.array) {
        if (a.length !== b.length) {
            return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    else if (aType === util_js_1.ZodParsedType.date && bType === util_js_1.ZodParsedType.date && +a === +b) {
        return { valid: true, data: a };
    }
    else {
        return { valid: false };
    }
}
class ZodIntersection extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
            if ((0, parseUtil_js_1.isAborted)(parsedLeft) || (0, parseUtil_js_1.isAborted)(parsedRight)) {
                return parseUtil_js_1.INVALID;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                    code: ZodError_js_1.ZodIssueCode.invalid_intersection_types,
                });
                return parseUtil_js_1.INVALID;
            }
            if ((0, parseUtil_js_1.isDirty)(parsedLeft) || (0, parseUtil_js_1.isDirty)(parsedRight)) {
                status.dirty();
            }
            return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
            ]).then(([left, right]) => handleParsed(left, right));
        }
        else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }));
        }
    }
}
exports.ZodIntersection = ZodIntersection;
ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
        left: left,
        right: right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params),
    });
};
// type ZodTupleItems = [ZodTypeAny, ...ZodTypeAny[]];
class ZodTuple extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.array,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            return parseUtil_js_1.INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            status.dirty();
        }
        const items = [...ctx.data]
            .map((item, itemIndex) => {
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema)
                return null;
            return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        })
            .filter((x) => !!x); // filter nulls
        if (ctx.common.async) {
            return Promise.all(items).then((results) => {
                return parseUtil_js_1.ParseStatus.mergeArray(status, results);
            });
        }
        else {
            return parseUtil_js_1.ParseStatus.mergeArray(status, items);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple({
            ...this._def,
            rest,
        });
    }
}
exports.ZodTuple = ZodTuple;
ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params),
    });
};
class ZodRecord extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
            pairs.push({
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
                value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (ctx.common.async) {
            return parseUtil_js_1.ParseStatus.mergeObjectAsync(status, pairs);
        }
        else {
            return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(third),
            });
        }
        return new ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second),
        });
    }
}
exports.ZodRecord = ZodRecord;
class ZodMap extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.map) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.map,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
            return {
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
                value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])),
            };
        });
        if (ctx.common.async) {
            const finalMap = new Map();
            return Promise.resolve().then(async () => {
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return parseUtil_js_1.INVALID;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return { status: status.value, value: finalMap };
            });
        }
        else {
            const finalMap = new Map();
            for (const pair of pairs) {
                const key = pair.key;
                const value = pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                    return parseUtil_js_1.INVALID;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                    status.dirty();
                }
                finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
        }
    }
}
exports.ZodMap = ZodMap;
ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params),
    });
};
class ZodSet extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.set) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.set,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                    code: ZodError_js_1.ZodIssueCode.too_small,
                    minimum: def.minSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.minSize.message,
                });
                status.dirty();
            }
        }
        if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                    code: ZodError_js_1.ZodIssueCode.too_big,
                    maximum: def.maxSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.maxSize.message,
                });
                status.dirty();
            }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements) {
            const parsedSet = new Set();
            for (const element of elements) {
                if (element.status === "aborted")
                    return parseUtil_js_1.INVALID;
                if (element.status === "dirty")
                    status.dirty();
                parsedSet.add(element.value);
            }
            return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
            return Promise.all(elements).then((elements) => finalizeSet(elements));
        }
        else {
            return finalizeSet(elements);
        }
    }
    min(minSize, message) {
        return new ZodSet({
            ...this._def,
            minSize: { value: minSize, message: errorUtil_js_1.errorUtil.toString(message) },
        });
    }
    max(maxSize, message) {
        return new ZodSet({
            ...this._def,
            maxSize: { value: maxSize, message: errorUtil_js_1.errorUtil.toString(message) },
        });
    }
    size(size, message) {
        return this.min(size, message).max(size, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
exports.ZodSet = ZodSet;
ZodSet.create = (valueType, params) => {
    return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params),
    });
};
class ZodFunction extends ZodType {
    constructor() {
        super(...arguments);
        this.validate = this.implement;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.function) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.function,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        function makeArgsIssue(args, error) {
            return (0, parseUtil_js_1.makeIssue)({
                data: args,
                path: ctx.path,
                errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
                issueData: {
                    code: ZodError_js_1.ZodIssueCode.invalid_arguments,
                    argumentsError: error,
                },
            });
        }
        function makeReturnsIssue(returns, error) {
            return (0, parseUtil_js_1.makeIssue)({
                data: returns,
                path: ctx.path,
                errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
                issueData: {
                    code: ZodError_js_1.ZodIssueCode.invalid_return_type,
                    returnTypeError: error,
                },
            });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return (0, parseUtil_js_1.OK)(async function (...args) {
                const error = new ZodError_js_1.ZodError([]);
                const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await Reflect.apply(fn, this, parsedArgs);
                const parsedReturns = await me._def.returns._def.type
                    .parseAsync(result, params)
                    .catch((e) => {
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        }
        else {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return (0, parseUtil_js_1.OK)(function (...args) {
                const parsedArgs = me._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError_js_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
                }
                const result = Reflect.apply(fn, this, parsedArgs.data);
                const parsedReturns = me._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError_js_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create()),
        });
    }
    returns(returnType) {
        return new ZodFunction({
            ...this._def,
            returns: returnType,
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    static create(args, returns, params) {
        return new ZodFunction({
            args: (args ? args : ZodTuple.create([]).rest(ZodUnknown.create())),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params),
        });
    }
}
exports.ZodFunction = ZodFunction;
class ZodLazy extends ZodType {
    get schema() {
        return this._def.getter();
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
}
exports.ZodLazy = ZodLazy;
ZodLazy.create = (getter, params) => {
    return new ZodLazy({
        getter: getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params),
    });
};
class ZodLiteral extends ZodType {
    _parse(input) {
        if (input.data !== this._def.value) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                received: ctx.data,
                code: ZodError_js_1.ZodIssueCode.invalid_literal,
                expected: this._def.value,
            });
            return parseUtil_js_1.INVALID;
        }
        return { status: "valid", value: input.data };
    }
    get value() {
        return this._def.value;
    }
}
exports.ZodLiteral = ZodLiteral;
ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
        value: value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params),
    });
};
function createZodEnum(values, params) {
    return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params),
    });
}
class ZodEnum extends ZodType {
    _parse(input) {
        if (typeof input.data !== "string") {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                expected: util_js_1.util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodError_js_1.ZodIssueCode.invalid_type,
            });
            return parseUtil_js_1.INVALID;
        }
        if (!this._cache) {
            this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                received: ctx.data,
                code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    extract(values, newDef = this._def) {
        return ZodEnum.create(values, {
            ...this._def,
            ...newDef,
        });
    }
    exclude(values, newDef = this._def) {
        return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
            ...this._def,
            ...newDef,
        });
    }
}
exports.ZodEnum = ZodEnum;
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
    _parse(input) {
        const nativeEnumValues = util_js_1.util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.string && ctx.parsedType !== util_js_1.ZodParsedType.number) {
            const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                expected: util_js_1.util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodError_js_1.ZodIssueCode.invalid_type,
            });
            return parseUtil_js_1.INVALID;
        }
        if (!this._cache) {
            this._cache = new Set(util_js_1.util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
            const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                received: ctx.data,
                code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
    }
    get enum() {
        return this._def.values;
    }
}
exports.ZodNativeEnum = ZodNativeEnum;
ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params),
    });
};
class ZodPromise extends ZodType {
    unwrap() {
        return this._def.type;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.promise && ctx.common.async === false) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.promise,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        const promisified = ctx.parsedType === util_js_1.ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return (0, parseUtil_js_1.OK)(promisified.then((data) => {
            return this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.common.contextualErrorMap,
            });
        }));
    }
}
exports.ZodPromise = ZodPromise;
ZodPromise.create = (schema, params) => {
    return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params),
    });
};
class ZodEffects extends ZodType {
    innerType() {
        return this._def.schema;
    }
    sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
            ? this._def.schema.sourceType()
            : this._def.schema;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
            addIssue: (arg) => {
                (0, parseUtil_js_1.addIssueToContext)(ctx, arg);
                if (arg.fatal) {
                    status.abort();
                }
                else {
                    status.dirty();
                }
            },
            get path() {
                return ctx.path;
            },
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data, checkCtx);
            if (ctx.common.async) {
                return Promise.resolve(processed).then(async (processed) => {
                    if (status.value === "aborted")
                        return parseUtil_js_1.INVALID;
                    const result = await this._def.schema._parseAsync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx,
                    });
                    if (result.status === "aborted")
                        return parseUtil_js_1.INVALID;
                    if (result.status === "dirty")
                        return (0, parseUtil_js_1.DIRTY)(result.value);
                    if (status.value === "dirty")
                        return (0, parseUtil_js_1.DIRTY)(result.value);
                    return result;
                });
            }
            else {
                if (status.value === "aborted")
                    return parseUtil_js_1.INVALID;
                const result = this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx,
                });
                if (result.status === "aborted")
                    return parseUtil_js_1.INVALID;
                if (result.status === "dirty")
                    return (0, parseUtil_js_1.DIRTY)(result.value);
                if (status.value === "dirty")
                    return (0, parseUtil_js_1.DIRTY)(result.value);
                return result;
            }
        }
        if (effect.type === "refinement") {
            const executeRefinement = (acc) => {
                const result = effect.refinement(acc, checkCtx);
                if (ctx.common.async) {
                    return Promise.resolve(result);
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.common.async === false) {
                const inner = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inner.status === "aborted")
                    return parseUtil_js_1.INVALID;
                if (inner.status === "dirty")
                    status.dirty();
                // return value is ignored
                executeRefinement(inner.value);
                return { status: status.value, value: inner.value };
            }
            else {
                return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
                    if (inner.status === "aborted")
                        return parseUtil_js_1.INVALID;
                    if (inner.status === "dirty")
                        status.dirty();
                    return executeRefinement(inner.value).then(() => {
                        return { status: status.value, value: inner.value };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.common.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (!(0, parseUtil_js_1.isValid)(base))
                    return parseUtil_js_1.INVALID;
                const result = effect.transform(base.value, checkCtx);
                if (result instanceof Promise) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return { status: status.value, value: result };
            }
            else {
                return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
                    if (!(0, parseUtil_js_1.isValid)(base))
                        return parseUtil_js_1.INVALID;
                    return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                        status: status.value,
                        value: result,
                    }));
                });
            }
        }
        util_js_1.util.assertNever(effect);
    }
}
exports.ZodEffects = ZodEffects;
exports.ZodTransformer = ZodEffects;
ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params),
    });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params),
    });
};
class ZodOptional extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.undefined) {
            return (0, parseUtil_js_1.OK)(undefined);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
exports.ZodOptional = ZodOptional;
ZodOptional.create = (type, params) => {
    return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params),
    });
};
class ZodNullable extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.null) {
            return (0, parseUtil_js_1.OK)(null);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
exports.ZodNullable = ZodNullable;
ZodNullable.create = (type, params) => {
    return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params),
    });
};
class ZodDefault extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === util_js_1.ZodParsedType.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    removeDefault() {
        return this._def.innerType;
    }
}
exports.ZodDefault = ZodDefault;
ZodDefault.create = (type, params) => {
    return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params),
    });
};
class ZodCatch extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        // newCtx is used to not collect issues from inner types in ctx
        const newCtx = {
            ...ctx,
            common: {
                ...ctx.common,
                issues: [],
            },
        };
        const result = this._def.innerType._parse({
            data: newCtx.data,
            path: newCtx.path,
            parent: {
                ...newCtx,
            },
        });
        if ((0, parseUtil_js_1.isAsync)(result)) {
            return result.then((result) => {
                return {
                    status: "valid",
                    value: result.status === "valid"
                        ? result.value
                        : this._def.catchValue({
                            get error() {
                                return new ZodError_js_1.ZodError(newCtx.common.issues);
                            },
                            input: newCtx.data,
                        }),
                };
            });
        }
        else {
            return {
                status: "valid",
                value: result.status === "valid"
                    ? result.value
                    : this._def.catchValue({
                        get error() {
                            return new ZodError_js_1.ZodError(newCtx.common.issues);
                        },
                        input: newCtx.data,
                    }),
            };
        }
    }
    removeCatch() {
        return this._def.innerType;
    }
}
exports.ZodCatch = ZodCatch;
ZodCatch.create = (type, params) => {
    return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params),
    });
};
class ZodNaN extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.nan) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: util_js_1.ZodParsedType.nan,
                received: ctx.parsedType,
            });
            return parseUtil_js_1.INVALID;
        }
        return { status: "valid", value: input.data };
    }
}
exports.ZodNaN = ZodNaN;
ZodNaN.create = (params) => {
    return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params),
    });
};
exports.BRAND = Symbol("zod_brand");
class ZodBranded extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    unwrap() {
        return this._def.type;
    }
}
exports.ZodBranded = ZodBranded;
class ZodPipeline extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
            const handleAsync = async () => {
                const inResult = await this._def.in._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inResult.status === "aborted")
                    return parseUtil_js_1.INVALID;
                if (inResult.status === "dirty") {
                    status.dirty();
                    return (0, parseUtil_js_1.DIRTY)(inResult.value);
                }
                else {
                    return this._def.out._parseAsync({
                        data: inResult.value,
                        path: ctx.path,
                        parent: ctx,
                    });
                }
            };
            return handleAsync();
        }
        else {
            const inResult = this._def.in._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
            if (inResult.status === "aborted")
                return parseUtil_js_1.INVALID;
            if (inResult.status === "dirty") {
                status.dirty();
                return {
                    status: "dirty",
                    value: inResult.value,
                };
            }
            else {
                return this._def.out._parseSync({
                    data: inResult.value,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
    }
    static create(a, b) {
        return new ZodPipeline({
            in: a,
            out: b,
            typeName: ZodFirstPartyTypeKind.ZodPipeline,
        });
    }
}
exports.ZodPipeline = ZodPipeline;
class ZodReadonly extends ZodType {
    _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
            if ((0, parseUtil_js_1.isValid)(data)) {
                data.value = Object.freeze(data.value);
            }
            return data;
        };
        return (0, parseUtil_js_1.isAsync)(result) ? result.then((data) => freeze(data)) : freeze(result);
    }
    unwrap() {
        return this._def.innerType;
    }
}
exports.ZodReadonly = ZodReadonly;
ZodReadonly.create = (type, params) => {
    return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params),
    });
};
////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      z.custom      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
function cleanParams(params, data) {
    const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
    const p2 = typeof p === "string" ? { message: p } : p;
    return p2;
}
function custom(check, _params = {}, 
/**
 * @deprecated
 *
 * Pass `fatal` into the params object instead:
 *
 * ```ts
 * z.string().custom((val) => val.length > 5, { fatal: false })
 * ```
 *
 */
fatal) {
    if (check)
        return ZodAny.create().superRefine((data, ctx) => {
            const r = check(data);
            if (r instanceof Promise) {
                return r.then((r) => {
                    if (!r) {
                        const params = cleanParams(_params, data);
                        const _fatal = params.fatal ?? fatal ?? true;
                        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
                    }
                });
            }
            if (!r) {
                const params = cleanParams(_params, data);
                const _fatal = params.fatal ?? fatal ?? true;
                ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
            }
            return;
        });
    return ZodAny.create();
}
exports.late = {
    object: ZodObject.lazycreate,
};
var ZodFirstPartyTypeKind;
(function (ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (exports.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}));
// requires TS 4.4+
class Class {
    constructor(..._) { }
}
const instanceOfType = (
// const instanceOfType = <T extends new (...args: any[]) => any>(
cls, params = {
    message: `Input not instance of ${cls.name}`,
}) => custom((data) => data instanceof cls, params);
exports["instanceof"] = instanceOfType;
const stringType = ZodString.create;
exports.string = stringType;
const numberType = ZodNumber.create;
exports.number = numberType;
const nanType = ZodNaN.create;
exports.nan = nanType;
const bigIntType = ZodBigInt.create;
exports.bigint = bigIntType;
const booleanType = ZodBoolean.create;
exports.boolean = booleanType;
const dateType = ZodDate.create;
exports.date = dateType;
const symbolType = ZodSymbol.create;
exports.symbol = symbolType;
const undefinedType = ZodUndefined.create;
exports.undefined = undefinedType;
const nullType = ZodNull.create;
exports["null"] = nullType;
const anyType = ZodAny.create;
exports.any = anyType;
const unknownType = ZodUnknown.create;
exports.unknown = unknownType;
const neverType = ZodNever.create;
exports.never = neverType;
const voidType = ZodVoid.create;
exports["void"] = voidType;
const arrayType = ZodArray.create;
exports.array = arrayType;
const objectType = ZodObject.create;
exports.object = objectType;
const strictObjectType = ZodObject.strictCreate;
exports.strictObject = strictObjectType;
const unionType = ZodUnion.create;
exports.union = unionType;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
exports.discriminatedUnion = discriminatedUnionType;
const intersectionType = ZodIntersection.create;
exports.intersection = intersectionType;
const tupleType = ZodTuple.create;
exports.tuple = tupleType;
const recordType = ZodRecord.create;
exports.record = recordType;
const mapType = ZodMap.create;
exports.map = mapType;
const setType = ZodSet.create;
exports.set = setType;
const functionType = ZodFunction.create;
exports["function"] = functionType;
const lazyType = ZodLazy.create;
exports.lazy = lazyType;
const literalType = ZodLiteral.create;
exports.literal = literalType;
const enumType = ZodEnum.create;
exports["enum"] = enumType;
const nativeEnumType = ZodNativeEnum.create;
exports.nativeEnum = nativeEnumType;
const promiseType = ZodPromise.create;
exports.promise = promiseType;
const effectsType = ZodEffects.create;
exports.effect = effectsType;
exports.transformer = effectsType;
const optionalType = ZodOptional.create;
exports.optional = optionalType;
const nullableType = ZodNullable.create;
exports.nullable = nullableType;
const preprocessType = ZodEffects.createWithPreprocess;
exports.preprocess = preprocessType;
const pipelineType = ZodPipeline.create;
exports.pipeline = pipelineType;
const ostring = () => stringType().optional();
exports.ostring = ostring;
const onumber = () => numberType().optional();
exports.onumber = onumber;
const oboolean = () => booleanType().optional();
exports.oboolean = oboolean;
exports.coerce = {
    string: ((arg) => ZodString.create({ ...arg, coerce: true })),
    number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
    boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true,
    })),
    bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
    date: ((arg) => ZodDate.create({ ...arg, coerce: true })),
};
exports.NEVER = parseUtil_js_1.INVALID;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const http_exception_filter_1 = __webpack_require__(/*! ./common/filters/http-exception.filter */ "./src/common/filters/http-exception.filter.ts");
const audit_log_interceptor_1 = __webpack_require__(/*! ./common/interceptors/audit-log.interceptor */ "./src/common/interceptors/audit-log.interceptor.ts");
const prisma_service_1 = __webpack_require__(/*! ./prisma/prisma.service */ "./src/prisma/prisma.service.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
        : isDevelopment
            ? true
            : ['http://localhost:5173'];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'accept',
            'accept-encoding',
            'authorization',
            'content-type',
            'dnt',
            'origin',
            'user-agent',
            'x-csrftoken',
            'x-requested-with',
            'x-temp-role',
            'x-impersonated-by',
        ],
    });
    app.useGlobalPipes(new nestjs_zod_1.ZodValidationPipe());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const prismaService = app.get(prisma_service_1.PrismaService);
    app.useGlobalInterceptors(new audit_log_interceptor_1.AuditLogInterceptor(prismaService));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

})();

/******/ })()
;