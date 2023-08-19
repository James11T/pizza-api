const assertiveEnv = <TKey extends string>(...keys: TKey[]) => {
  const values = {} as Record<TKey, string>;

  for (const key of keys) {
    const value = process.env[key];
    if (!value) throw new Error(`Environment variable "${key}" missing`);
    values[key] = value;
  }

  return values;
};

export default assertiveEnv;
