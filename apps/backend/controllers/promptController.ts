import { Request, Response } from "express";
import { Prompt } from "../entities/Prompt";
import { databaseService } from "../services/databaseService";
import { MediaCategory } from "../types/MediaCategory";

export const listPrompts = (req: Request, res: Response): void => {
    const { category } = req.query;
    const promptRepository = databaseService.getDataSource().getRepository(Prompt);

    const whereClause: any = {};
    if (category && Object.values(MediaCategory).includes(category as MediaCategory)) {
        whereClause.category = category;
    }

    promptRepository.find({ where: whereClause }).then(prompts => {
        res.json(prompts);
    });
};

export const createPrompt = (req: Request, res: Response): void => {
    const { title, prompt, person_count, category }: { title: string; prompt: string, person_count: number, category?: MediaCategory } = req.body;
    const newPrompt = new Prompt();
    newPrompt.title = title;
    newPrompt.prompt = prompt;
    newPrompt.person_count = person_count;
    newPrompt.category = category || null;
    const promptRepository = databaseService.getDataSource().getRepository(Prompt);
    promptRepository.save(newPrompt);

    res.status(201).json(newPrompt);
};

export const getPromptById = (req: Request, res: Response): void => {
    const { id } = req.params;
    const promptRepository = databaseService.getDataSource().getRepository(Prompt);
    promptRepository.findOneBy({ id: parseInt(id) }).then(prompt => {
        if (prompt) {
            res.json(prompt);
        } else {
            res.status(404).json({ message: "Prompt not found" });
        }
    });
};

export const updatePrompt = (req: Request, res: Response): void => {
    const { id } = req.params;
    const { title, prompt, person_count, category }: { title: string; prompt: string; person_count: number; category?: MediaCategory | null } = req.body;
    const promptRepository = databaseService.getDataSource().getRepository(Prompt);
    promptRepository.findOneBy({ id: parseInt(id) }).then(existingPrompt => {
        if (existingPrompt) {
            existingPrompt.title = title;
            existingPrompt.prompt = prompt;
            existingPrompt.person_count = person_count;
            if (category !== undefined) {
                existingPrompt.category = category;
            }
            promptRepository.save(existingPrompt);
            res.json(existingPrompt);
        }
        else {
            res.status(404).json({ message: "Prompt not found" });
        }
    });
};

export const deletePrompt = (req: Request, res: Response): void => {
    const { id } = req.params;
    const promptRepository = databaseService.getDataSource().getRepository(Prompt);
    promptRepository.findOneBy({ id: parseInt(id) }).then(existingPrompt => {
        if (existingPrompt) {
            promptRepository.remove(existingPrompt);
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Prompt not found" });
        }
    });
};