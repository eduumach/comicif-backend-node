import { Request, Response } from "express";
import { Prompt } from "../entities/Prompt";
import { AppDataSource } from "../app";

export const listPrompts = (req: Request, res: Response): void => {
    const promptRepository = AppDataSource.getRepository(Prompt);
    promptRepository.find().then(prompts => {
        res.json(prompts);
    });
};

export const createPrompt = (req: Request, res: Response): void => {
    const { title, prompt }: { title: string; prompt: string } = req.body;
    const newPrompt = new Prompt();
    newPrompt.title = title;
    newPrompt.prompt = prompt;
    const promptRepository = AppDataSource.getRepository(Prompt);
    promptRepository.save(newPrompt);

    res.status(201).json(newPrompt);
};
