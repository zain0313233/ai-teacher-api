"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternsModule = void 0;
const common_1 = require("@nestjs/common");
const patterns_controller_1 = require("./patterns.controller");
const patterns_internal_controller_1 = require("./patterns-internal.controller");
const patterns_service_1 = require("./patterns.service");
const prisma_module_1 = require("../prisma/prisma.module");
const internal_api_guard_1 = require("../common/guards/internal-api.guard");
let PatternsModule = class PatternsModule {
};
exports.PatternsModule = PatternsModule;
exports.PatternsModule = PatternsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [patterns_controller_1.PatternsController, patterns_internal_controller_1.PatternsInternalController],
        providers: [patterns_service_1.PatternsService, internal_api_guard_1.InternalApiGuard],
        exports: [patterns_service_1.PatternsService],
    })
], PatternsModule);
//# sourceMappingURL=patterns.module.js.map