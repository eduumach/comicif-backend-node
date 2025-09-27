import { Request, Response } from "express";
import { Prompt } from "../entities/Prompt";
import { databaseService } from "../services/databaseService";

export const listPrompts = (req: Request, res: Response): void => {
    const promptRepository = databaseService.getDataSource().getRepository(Prompt);
    promptRepository.find().then(prompts => {
        res.json(prompts);
    });
};

export const createPrompt = (req: Request, res: Response): void => {
    const { title, prompt }: { title: string; prompt: string } = req.body;
    const newPrompt = new Prompt();
    newPrompt.title = title;
    newPrompt.prompt = prompt;
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
    const { title, prompt }: { title: string; prompt: string } = req.body;
    const promptRepository = databaseService.getDataSource().getRepository(Prompt);
    promptRepository.findOneBy({ id: parseInt(id) }).then(existingPrompt => {
        if (existingPrompt) {
            existingPrompt.title = title;
            existingPrompt.prompt = prompt;
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