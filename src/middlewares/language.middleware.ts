// src/middlewares/language.middleware.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";

export async function validateLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { lang } = req.params;

  if (!lang) {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Language code is required"
      }
    });
    return;
  }

  // Check if language exists in database
  const language = await prisma.language.findUnique({
    where: { code: lang }
  });

  if (!language) {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: `Language '${lang}' is not supported`
      }
    });
    return;
  }

  next();
}