import { z } from 'zod';
import { Role } from '../../domain/enums/role.enum';
import { DocumentType } from '../../domain/enums/document-type.enum';

export const registerSchema = z
  .object({
    email: z.string().email(),
    phone: z.string().min(8),
    password: z.string().min(8),
    role: z.nativeEnum(Role),
    fullName: z.string().optional(),
    address: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationalId: z.string().optional(),
    documents: z.record(z.string(), z.string().url({ message: 'Document must be a URL' })).optional(),
    driver: z
      .object({
        licenseNumber: z.string().optional(),
        vehicleMake: z.string().optional(),
        vehicleModel: z.string().optional(),
        vehicleNumberPlate: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === Role.BUYER) {
      const requiredBuyerFields: Array<[keyof typeof data, string]> = [
        ['fullName', 'fullName'],
        ['address', 'address'],
        ['gender', 'gender'],
        ['dateOfBirth', 'dateOfBirth'],
        ['nationalId', 'nationalId'],
      ];
      requiredBuyerFields.forEach(([key, label]) => {
        if (!data[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [label],
            message: 'Required for buyer registration',
          });
        }
      });
    }

    if (data.role === Role.SELLER || data.role === Role.DRIVER) {
      if (!data.documents) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documents'],
          message: 'Documents are required for seller/driver registration',
        });
      } else {
        const requiredDocuments = [
          DocumentType.NATIONAL_ID,
          DocumentType.PROOF_OF_RESIDENCE,
          DocumentType.SELFIE,
        ];
        const driverDocs =
          data.role === Role.DRIVER
            ? [DocumentType.DRIVER_LICENSE, DocumentType.VEHICLE_DOCUMENT]
            : [];

        [...requiredDocuments, ...driverDocs].forEach((docType) => {
          if (!data.documents?.[docType]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['documents', docType],
              message: `${docType} document is required`,
            });
          }
        });
      }
    }

    if (data.role === Role.DRIVER) {
      if (!data.driver?.licenseNumber || !data.driver?.vehicleNumberPlate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['driver'],
          message: 'Driver license number and vehicle number plate are required',
        });
      }
    }
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const verifyPhoneSchema = z.object({
  phone: z.string().min(8),
  code: z.string().min(4),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});



export const approveSchema = z.object({
  userId: z.string().uuid(),
});

