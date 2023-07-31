import { Container } from "typedi";
import { IModelDI } from "src/types/dependencyInjectors";

const dependencyInjector = async ({ models }: { models: IModelDI[] }): Promise<void> => {
    try {
        models.forEach((m) => {
            Container.set(m.name, m.model);
        });
    } catch (error) {
        console.error(`Error on dependency injector loader: ${error}`);
        throw error;
    }
};

export { dependencyInjector };
export default dependencyInjector;
