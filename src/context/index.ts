import type { AddContextPayload, Database, ResetOptions } from "../database";
import type { AddContextOptions } from "../types";

export class ContextService {
  #vectorService: Database;

  constructor(vectorService: Database) {
    this.#vectorService = vectorService;
  }

  /**
   * A method that allows you to add various data types into a vector database.
   * It supports plain text, embeddings, PDF, and CSV. Additionally, it handles text-splitting for CSV and PDF.
   *
   * @example
   * ```typescript
   * await addDataToVectorDb({
   *   dataType: "pdf",
   *   fileSource: "./data/the_wonderful_wizard_of_oz.pdf",
   *   opts: { chunkSize: 500, chunkOverlap: 50 },
   * });
   * // OR
   * await addDataToVectorDb({
   *   dataType: "text",
   *   data: "Paris, the capital of France, is renowned for its iconic landmark, the Eiffel Tower, which was completed in 1889 and stands at 330 meters tall.",
   * });
   * ```
   */
  async add(context: AddContextPayload, options?: AddContextOptions) {
    const retrievalServiceStatus = await this.#vectorService.save(context, options);
    return retrievalServiceStatus === "Success" ? "OK" : "NOT-OK";
  }

  async reset(options?: ResetOptions | undefined) {
    await this.#vectorService.reset(
      options?.namespace ? { namespace: options.namespace } : undefined
    );
  }

  async delete(id: string | string[]) {
    await this.#vectorService.delete(typeof id === "string" ? [id] : id);
  }
}
