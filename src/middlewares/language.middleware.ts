// src/middlewares/language.middleware.ts
import { Request, Response, NextFunction } from "express";
<<<<<<< HEAD
import { isSupportedLanguage } from "../types/language.types";
=======
import { prisma } from "../database/prisma";
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c

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

<<<<<<< HEAD
  // Check if language is supported
  if (!isSupportedLanguage(lang)) {
    res.status(400).json({
      success: false,
      error: {
        code: "UNSUPPORTED_LANGUAGE",
        message: `Language '${lang}' is not supported. Supported languages: ar, fa, en, ur`
=======
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
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
      }
    });
    return;
  }

  next();
}