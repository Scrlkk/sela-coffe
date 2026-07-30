/**
 * Mengubah semua nilai bertipe BigInt menjadi String secara rekursif dalam objek/array.
 * ponytail: 1-function universal BigInt JSON serializer
 */
export const serializeBigInt = <T>(data: T): T => {
  if (data === null || data === undefined) return data;

  if (typeof data === "bigint") {
    return String(data) as unknown as T;
  }

  if (data instanceof Date) {
    return data as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeBigInt(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeBigInt(value);
    }
    return result as T;
  }

  return data;
};
