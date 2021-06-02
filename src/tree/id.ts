const existingId: { [k: string]: true } = {};

const generateId = (): string => {
  const randInt = Math.round(Math.random() * 1e14);
  const id = (Date.now() + randInt).toString(36);

  if (idExists(id)) {
    return generateId();
  }

  return id;
};

const idExists = (id: string) => Boolean(existingId[id]);

export { generateId };
