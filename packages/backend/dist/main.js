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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
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
    async logout(req) {
        return { message: '登出成功' };
    }
    async refreshToken(refreshTokenDto) {
        return this.accountService.refreshToken(refreshTokenDto);
    }
    async getCurrentUser(req) {
        return this.accountService.getCurrentUser(req.user.id);
    }
    async getCurrentRole(req) {
        const user = await this.accountService.getCurrentUser(req.user.id);
        return { role: user.role };
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
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('token/refresh'),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_2.RefreshTokenRequestSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof shared_1.RefreshTokenRequestDto !== "undefined" && shared_1.RefreshTokenRequestDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AccountController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('users/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AccountController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('current-role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AccountController.prototype, "getCurrentRole", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_2.ChangePasswordRequestSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_h = typeof shared_1.ChangePasswordRequestDto !== "undefined" && shared_1.ChangePasswordRequestDto) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
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
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
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
const zod_1 = __webpack_require__(/*! zod */ "zod");
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
        const startTime = Date.now();
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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoursesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const courses_service_1 = __webpack_require__(/*! ../services/courses.service */ "./src/cramschool/services/courses.service.ts");
const shared_1 = __webpack_require__(/*! @9jang/shared */ "@9jang/shared");
const nestjs_zod_1 = __webpack_require__(/*! nestjs-zod */ "nestjs-zod");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../account/guards/jwt-auth.guard */ "./src/account/guards/jwt-auth.guard.ts");
let CoursesController = class CoursesController {
    constructor(coursesService) {
        this.coursesService = coursesService;
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
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], CoursesController.prototype, "getCourse", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateCourseSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.CreateCourseDto !== "undefined" && shared_1.CreateCourseDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateCourseSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.UpdateCourseDto !== "undefined" && shared_1.UpdateCourseDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], CoursesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CoursesController.prototype, "deleteCourse", null);
exports.CoursesController = CoursesController = __decorate([
    (0, common_1.Controller)('cramschool/courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof courses_service_1.CoursesService !== "undefined" && courses_service_1.CoursesService) === "function" ? _a : Object])
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const questions_service_1 = __webpack_require__(/*! ../services/questions.service */ "./src/cramschool/services/questions.service.ts");
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
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new nestjs_zod_1.ZodValidationPipe(shared_1.QuestionQuerySchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.QuestionQuery !== "undefined" && shared_1.QuestionQuery) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], QuestionsController.prototype, "getQuestion", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateQuestionSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.CreateQuestionDto !== "undefined" && shared_1.CreateQuestionDto) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], QuestionsController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateQuestionSchema))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.UpdateQuestionDto !== "undefined" && shared_1.UpdateQuestionDto) === "function" ? _g : Object, Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], QuestionsController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], QuestionsController.prototype, "deleteQuestion", null);
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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourcesController = void 0;
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
    __metadata("design:paramtypes", [Object, Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "getResources", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ResourcesController.prototype, "getResource", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateLearningResourceSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof shared_1.CreateLearningResourceDto !== "undefined" && shared_1.CreateLearningResourceDto) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], ResourcesController.prototype, "createResource", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateLearningResourceSchema))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof shared_1.UpdateLearningResourceDto !== "undefined" && shared_1.UpdateLearningResourceDto) === "function" ? _f : Object, Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], ResourcesController.prototype, "updateResource", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], ResourcesController.prototype, "deleteResource", null);
exports.ResourcesController = ResourcesController = __decorate([
    (0, common_1.Controller)('cramschool/resources'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof resources_service_1.ResourcesService !== "undefined" && resources_service_1.ResourcesService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], ResourcesController);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentGroupsController = void 0;
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
    __metadata("design:paramtypes", [typeof (_d = typeof shared_1.CreateStudentGroupDto !== "undefined" && shared_1.CreateStudentGroupDto) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], StudentGroupsController.prototype, "createStudentGroup", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateStudentGroupSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof shared_1.UpdateStudentGroupDto !== "undefined" && shared_1.UpdateStudentGroupDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], StudentGroupsController.prototype, "updateStudentGroup", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], StudentGroupsController.prototype, "deleteStudentGroup", null);
__decorate([
    (0, common_1.Post)(':id/add-students'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.AddStudentsToGroupSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_j = typeof shared_1.AddStudentsToGroupDto !== "undefined" && shared_1.AddStudentsToGroupDto) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], StudentGroupsController.prototype, "addStudentsToGroup", null);
__decorate([
    (0, common_1.Post)(':id/remove-students'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.RemoveStudentsFromGroupSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_l = typeof shared_1.RemoveStudentsFromGroupDto !== "undefined" && shared_1.RemoveStudentsFromGroupDto) === "function" ? _l : Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], StudentGroupsController.prototype, "removeStudentsFromGroup", null);
exports.StudentGroupsController = StudentGroupsController = __decorate([
    (0, common_1.Controller)('cramschool/student-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof student_groups_service_1.StudentGroupsService !== "undefined" && student_groups_service_1.StudentGroupsService) === "function" ? _a : Object])
], StudentGroupsController);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StudentsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const students_service_1 = __webpack_require__(/*! ../services/students.service */ "./src/cramschool/services/students.service.ts");
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
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new nestjs_zod_1.ZodValidationPipe(shared_1.StudentQuerySchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof shared_1.StudentQuery !== "undefined" && shared_1.StudentQuery) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], StudentsController.prototype, "getStudent", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.CreateStudentSchema))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof shared_1.CreateStudentDto !== "undefined" && shared_1.CreateStudentDto) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], StudentsController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new nestjs_zod_1.ZodValidationPipe(shared_1.UpdateStudentSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.UpdateStudentDto !== "undefined" && shared_1.UpdateStudentDto) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], StudentsController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], StudentsController.prototype, "deleteStudent", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], StudentsController.prototype, "restoreStudent", null);
__decorate([
    (0, common_1.Get)(':id/tuition_status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], StudentsController.prototype, "getTuitionStatus", null);
__decorate([
    (0, common_1.Post)(':id/generate_tuition'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], StudentsController.prototype, "generateTuition", null);
__decorate([
    (0, common_1.Post)('batch-generate-tuitions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], StudentsController.prototype, "batchGenerateTuitions", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], StudentsController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)(':id/toggle-account-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], StudentsController.prototype, "toggleAccountStatus", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('cramschool/students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof students_service_1.StudentsService !== "undefined" && students_service_1.StudentsService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], StudentsController);


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
const students_service_1 = __webpack_require__(/*! ./services/students.service */ "./src/cramschool/services/students.service.ts");
const teachers_service_1 = __webpack_require__(/*! ./services/teachers.service */ "./src/cramschool/services/teachers.service.ts");
const courses_service_1 = __webpack_require__(/*! ./services/courses.service */ "./src/cramschool/services/courses.service.ts");
const enrollments_service_1 = __webpack_require__(/*! ./services/enrollments.service */ "./src/cramschool/services/enrollments.service.ts");
const enrollment_periods_service_1 = __webpack_require__(/*! ./services/enrollment-periods.service */ "./src/cramschool/services/enrollment-periods.service.ts");
const leaves_service_1 = __webpack_require__(/*! ./services/leaves.service */ "./src/cramschool/services/leaves.service.ts");
const questions_service_1 = __webpack_require__(/*! ./services/questions.service */ "./src/cramschool/services/questions.service.ts");
const resources_service_1 = __webpack_require__(/*! ./services/resources.service */ "./src/cramschool/services/resources.service.ts");
const student_groups_service_1 = __webpack_require__(/*! ./services/student-groups.service */ "./src/cramschool/services/student-groups.service.ts");
const fees_service_1 = __webpack_require__(/*! ./services/fees.service */ "./src/cramschool/services/fees.service.ts");
const media_controller_1 = __webpack_require__(/*! ./controllers/media.controller */ "./src/cramschool/controllers/media.controller.ts");
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
        ],
        providers: [
            students_service_1.StudentsService,
            teachers_service_1.TeachersService,
            courses_service_1.CoursesService,
            enrollments_service_1.EnrollmentsService,
            enrollment_periods_service_1.EnrollmentPeriodsService,
            leaves_service_1.LeavesService,
            questions_service_1.QuestionsService,
            resources_service_1.ResourcesService,
            student_groups_service_1.StudentGroupsService,
            fees_service_1.FeesService,
        ],
        exports: [
            students_service_1.StudentsService,
            teachers_service_1.TeachersService,
            courses_service_1.CoursesService,
        ],
    })
], CramschoolModule);


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

/***/ "./src/cramschool/services/questions.service.ts":
/*!******************************************************!*\
  !*** ./src/cramschool/services/questions.service.ts ***!
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
exports.QuestionsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let QuestionsService = class QuestionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getQuestions(query, userId, userRole) {
        if (userRole === 'STUDENT') {
            throw new common_1.ForbiddenException('學生不能查看題目列表');
        }
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
        return (0, pagination_util_1.createPaginatedResponse)(results.map((q) => this.toQuestionDto(q)), count, page, pageSize);
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
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以創建題目');
        }
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
    async updateQuestion(id, updateDto, userId, userRole) {
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以更新題目');
        }
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
        if (userRole !== 'TEACHER') {
            throw new common_1.ForbiddenException('只有老師可以刪除題目');
        }
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
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
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
    async updateResource(id, updateDto, userId, userRole) {
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

/***/ "./src/cramschool/services/students.service.ts":
/*!*****************************************************!*\
  !*** ./src/cramschool/services/students.service.ts ***!
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
exports.StudentsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./src/prisma/prisma.service.ts");
const pagination_util_1 = __webpack_require__(/*! ../../common/utils/pagination.util */ "./src/common/utils/pagination.util.ts");
let StudentsService = class StudentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudents(query, userId, userRole) {
        const page = query.page || 1;
        const pageSize = query.page_size || 10;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (userRole === 'TEACHER') {
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
                return (0, pagination_util_1.createPaginatedResponse)([], 0, page, pageSize);
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
        else if (query.has_unpaid_fees === 'no') {
            const studentsWithUnpaid = await this.prisma.cramschoolExtraFee.groupBy({
                by: ['studentId'],
                where: {
                    isDeleted: false,
                    paymentStatus: 'Unpaid',
                },
            });
            const unpaidStudentIds = studentsWithUnpaid.map((s) => s.studentId);
        }
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
            return {
                ...this.toStudentDto(student),
                total_fees: Number(totalFees._sum.amount || 0),
                unpaid_fees: Number(unpaidFees._sum.amount || 0),
                enrollments_count: student.enrollments.length,
                has_tuition_needed: hasTuitionNeeded,
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
        if (userRole !== 'ADMIN' && userRole !== 'ACCOUNTANT') {
            throw new common_1.ForbiddenException('只有管理員或會計可以創建學生');
        }
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
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StudentsService);


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

/***/ "zod":
/*!**********************!*\
  !*** external "zod" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("zod");

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