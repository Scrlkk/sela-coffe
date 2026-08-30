export interface StorageCrudOptions<
  T extends { id: string; isDeleted?: boolean },
> {
  generateId?: (item: Partial<T>) => string;
  onCreate?: (item: Partial<T>) => Partial<T>;
  onUpdate?: (existing: T, updates: Partial<T>) => Partial<T>;
  onDelete?: (existing: T) => Partial<T>;
  onRestore?: (existing: T) => Partial<T>;
  migrate?: (items: T[]) => T[];
}

export function createStorageCrud<
  T extends { id: string; isDeleted?: boolean },
>(key: string, initialData: T[], options?: StorageCrudOptions<T>) {
  const getRaw = (): T[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(initialData));
        return [...initialData];
      }
      let parsed: T[] = JSON.parse(raw);
      if (options?.migrate) {
        const migrated = options.migrate(parsed);
        if (JSON.stringify(migrated) !== raw) {
          localStorage.setItem(key, JSON.stringify(migrated));
        }
        parsed = migrated;
      }
      return parsed;
    } catch {
      return [...initialData];
    }
  };

  const get = (includeDeleted = false): T[] => {
    const data = getRaw();
    return includeDeleted ? data : data.filter((item) => !item.isDeleted);
  };

  const save = (items: T[]): void => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
    void e;
  }
  };

  const add = (item: Omit<T, "id"> & Partial<Pick<T, "id">>): T => {
    const all = getRaw();
    const id =
      item.id ||
      (options?.generateId
        ? options.generateId(item as Partial<T>)
        : `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const extra = options?.onCreate ? options.onCreate(item as Partial<T>) : {};
    const newItem = {
      ...item,
      ...extra,
      id,
      isDeleted: false,
    } as T;
    save([newItem, ...all]);
    return newItem;
  };

  const update = (id: string, updates: Partial<T>): T | null => {
    const all = getRaw();
    const index = all.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const extra = options?.onUpdate
      ? options.onUpdate(all[index], updates)
      : {};
    const updated = {
      ...all[index],
      ...updates,
      ...extra,
    };
    all[index] = updated;
    save(all);
    return updated;
  };

  const softDelete = (id: string): boolean => {
    const all = getRaw();
    const index = all.findIndex((i) => i.id === id);
    if (index === -1) return false;

    const extra = options?.onDelete ? options.onDelete(all[index]) : {};
    all[index] = { ...all[index], isDeleted: true, ...extra };
    save(all);
    return true;
  };

  const restore = (id: string): boolean => {
    const all = getRaw();
    const index = all.findIndex((i) => i.id === id);
    if (index === -1) return false;

    const extra = options?.onRestore ? options.onRestore(all[index]) : {};
    all[index] = { ...all[index], isDeleted: false, ...extra };
    save(all);
    return true;
  };

  return { get, getRaw, save, add, update, softDelete, restore };
}
