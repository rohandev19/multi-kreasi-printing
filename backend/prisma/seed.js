"use strict";
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = require("pg");
var bcrypt = __importStar(require("bcrypt"));
var pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '17210535Rohan',
    database: 'mkprinting',
});
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new client_1.PrismaClient({ adapter: adapter });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var roles, _i, roles_1, role, ownerRole, defaultEmail, existingAdmin, passwordHash, testUsers, _a, testUsers_1, user, role, existingUser, passwordHash, existingCompany, categoriesData, createdCategories, _b, categoriesData_1, cat, existingCat, newCat, productsData, _loop_1, _c, productsData_1, prod;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    roles = [
                        { name: 'Owner', displayName: 'System Owner', description: 'Full system access', permissions: ['*'] },
                        { name: 'Manager', displayName: 'Manager', description: 'Store and operational management', permissions: ['manage:users', 'manage:orders', 'view:reports'] },
                        { name: 'Sales', displayName: 'Sales Staff', description: 'Handles sales and customer relations', permissions: ['manage:orders', 'view:customers'] },
                        { name: 'Designer', displayName: 'Designer', description: 'Handles design assets', permissions: ['manage:designs', 'view:orders'] },
                        { name: 'Production_Staff', displayName: 'Production Staff', description: 'Handles printing and production', permissions: ['manage:production', 'view:orders'] },
                        { name: 'Warehouse_Staff', displayName: 'Warehouse Staff', description: 'Handles stock and materials', permissions: ['manage:inventory', 'view:orders'] },
                        { name: 'Finance_Staff', displayName: 'Finance Staff', description: 'Handles payments and invoices', permissions: ['manage:finance', 'view:orders'] },
                        { name: 'Customer', displayName: 'Customer', description: 'Standard user/customer', permissions: ['view:own_orders', 'create:order'] },
                    ];
                    _i = 0, roles_1 = roles;
                    _d.label = 1;
                case 1:
                    if (!(_i < roles_1.length)) return [3 /*break*/, 4];
                    role = roles_1[_i];
                    return [4 /*yield*/, prisma.role.upsert({
                            where: { name: role.name },
                            update: {},
                            create: {
                                name: role.name,
                                displayName: role.displayName,
                                description: role.description,
                                permissions: role.permissions,
                            },
                        })];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, prisma.role.findUnique({ where: { name: 'Owner' } })];
                case 5:
                    ownerRole = _d.sent();
                    if (!ownerRole) return [3 /*break*/, 9];
                    defaultEmail = 'admin@mkprinting.com';
                    return [4 /*yield*/, prisma.user.findUnique({ where: { email: defaultEmail } })];
                case 6:
                    existingAdmin = _d.sent();
                    if (!!existingAdmin) return [3 /*break*/, 9];
                    return [4 /*yield*/, bcrypt.hash('Admin@123!', 10)];
                case 7:
                    passwordHash = _d.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: defaultEmail,
                                passwordHash: passwordHash,
                                fullName: 'System Owner',
                                roleId: ownerRole.id,
                                status: 'ACTIVE',
                            },
                        })];
                case 8:
                    _d.sent();
                    console.log('Default admin created: admin@mkprinting.com / Admin@123!');
                    _d.label = 9;
                case 9:
                    testUsers = [
                        { name: 'Manager', email: 'manager@mkprinting.com', pass: 'Manager@123!' },
                        { name: 'Sales', email: 'sales@mkprinting.com', pass: 'Sales@123!' },
                        { name: 'Designer', email: 'designer@mkprinting.com', pass: 'Designer@123!' },
                        { name: 'Production_Staff', email: 'production@mkprinting.com', pass: 'Production@123!' },
                        { name: 'Warehouse_Staff', email: 'warehouse@mkprinting.com', pass: 'Warehouse@123!' },
                        { name: 'Finance_Staff', email: 'finance@mkprinting.com', pass: 'Finance@123!' },
                        { name: 'Customer', email: 'customer@example.com', pass: 'Customer@123!' },
                    ];
                    _a = 0, testUsers_1 = testUsers;
                    _d.label = 10;
                case 10:
                    if (!(_a < testUsers_1.length)) return [3 /*break*/, 16];
                    user = testUsers_1[_a];
                    return [4 /*yield*/, prisma.role.findUnique({ where: { name: user.name } })];
                case 11:
                    role = _d.sent();
                    if (!role) return [3 /*break*/, 15];
                    return [4 /*yield*/, prisma.user.findUnique({ where: { email: user.email } })];
                case 12:
                    existingUser = _d.sent();
                    if (!!existingUser) return [3 /*break*/, 15];
                    return [4 /*yield*/, bcrypt.hash(user.pass, 10)];
                case 13:
                    passwordHash = _d.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: user.email,
                                passwordHash: passwordHash,
                                fullName: "Test ".concat(user.name.replace('_', ' ')),
                                roleId: role.id,
                                status: 'ACTIVE',
                            },
                        })];
                case 14:
                    _d.sent();
                    console.log("Default ".concat(user.name, " created: ").concat(user.email, " / ").concat(user.pass));
                    _d.label = 15;
                case 15:
                    _a++;
                    return [3 /*break*/, 10];
                case 16: return [4 /*yield*/, prisma.customer.findFirst({
                        where: { email: 'info@tokoabc.com' }
                    })];
                case 17:
                    existingCompany = _d.sent();
                    if (!!existingCompany) return [3 /*break*/, 19];
                    return [4 /*yield*/, prisma.customer.create({
                            data: {
                                companyName: 'Toko ABC',
                                email: 'info@tokoabc.com',
                                phone: '081234567890',
                                address: 'Jl. Contoh No. 123, Jakarta',
                                loyaltyTier: 'Bronze',
                            },
                        })];
                case 18:
                    _d.sent();
                    console.log('Sample customer company created');
                    _d.label = 19;
                case 19:
                    categoriesData = [
                        { name: 'Business Cards', description: 'Professional business cards' },
                        { name: 'Banners', description: 'Indoor and outdoor banners' },
                        { name: 'Marketing', description: 'Brochures, flyers, and marketing materials' },
                        { name: 'Stickers', description: 'Custom die-cut stickers and labels' },
                    ];
                    createdCategories = [];
                    _b = 0, categoriesData_1 = categoriesData;
                    _d.label = 20;
                case 20:
                    if (!(_b < categoriesData_1.length)) return [3 /*break*/, 25];
                    cat = categoriesData_1[_b];
                    return [4 /*yield*/, prisma.category.findFirst({ where: { name: cat.name } })];
                case 21:
                    existingCat = _d.sent();
                    if (!!existingCat) return [3 /*break*/, 23];
                    return [4 /*yield*/, prisma.category.create({ data: cat })];
                case 22:
                    newCat = _d.sent();
                    createdCategories.push(newCat);
                    return [3 /*break*/, 24];
                case 23:
                    createdCategories.push(existingCat);
                    _d.label = 24;
                case 24:
                    _b++;
                    return [3 /*break*/, 20];
                case 25:
                    productsData = [
                        {
                            sku: 'BC-PREM-01',
                            name: 'Premium Business Cards',
                            description: '300gsm matte finish with double-sided printing. Box of 100.',
                            categoryName: 'Business Cards',
                            basePrice: 150000,
                            unitOfMeasure: 'Box',
                            imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        },
                        {
                            sku: 'BN-IND-01',
                            name: 'Indoor Vinyl Banner',
                            description: 'High-resolution indoor banner. Price per square meter.',
                            categoryName: 'Banners',
                            basePrice: 85000,
                            unitOfMeasure: 'SqMeter',
                            imageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        },
                        {
                            sku: 'MK-BRO-01',
                            name: 'Corporate Brochure',
                            description: 'A4 tri-fold brochure on glossy paper. Pack of 50.',
                            categoryName: 'Marketing',
                            basePrice: 250000,
                            unitOfMeasure: 'Pack',
                            imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        },
                        {
                            sku: 'ST-CUS-01',
                            name: 'Custom Stickers',
                            description: 'Die-cut vinyl stickers. Minimum order 100 pcs.',
                            categoryName: 'Stickers',
                            basePrice: 1500,
                            unitOfMeasure: 'Piece',
                            imageUrl: 'https://images.unsplash.com/photo-1626242557434-b2df76a0845a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        },
                    ];
                    _loop_1 = function (prod) {
                        var existingProd, category, newProduct;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0: return [4 /*yield*/, prisma.product.findUnique({ where: { sku: prod.sku } })];
                                case 1:
                                    existingProd = _e.sent();
                                    if (!!existingProd) return [3 /*break*/, 4];
                                    category = createdCategories.find(function (c) { return c.name === prod.categoryName; });
                                    if (!category) return [3 /*break*/, 4];
                                    return [4 /*yield*/, prisma.product.create({
                                            data: {
                                                sku: prod.sku,
                                                name: prod.name,
                                                description: prod.description,
                                                categoryId: category.id,
                                                basePrice: prod.basePrice,
                                                unitOfMeasure: prod.unitOfMeasure,
                                            },
                                        })];
                                case 2:
                                    newProduct = _e.sent();
                                    return [4 /*yield*/, prisma.productImage.create({
                                            data: {
                                                productId: newProduct.id,
                                                r2Path: 'dummy/path',
                                                url: prod.imageUrl,
                                                isPrimary: true,
                                            }
                                        })];
                                case 3:
                                    _e.sent();
                                    console.log("Created product: ".concat(prod.name));
                                    _e.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _c = 0, productsData_1 = productsData;
                    _d.label = 26;
                case 26:
                    if (!(_c < productsData_1.length)) return [3 /*break*/, 29];
                    prod = productsData_1[_c];
                    return [5 /*yield**/, _loop_1(prod)];
                case 27:
                    _d.sent();
                    _d.label = 28;
                case 28:
                    _c++;
                    return [3 /*break*/, 26];
                case 29: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
