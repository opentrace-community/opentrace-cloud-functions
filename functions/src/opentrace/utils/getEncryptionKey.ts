import {SecretManagerServiceClient} from "@google-cloud/secret-manager";

import config from "../../config";

const SECRET_KEY = `projects/${config.projectNumber}/secrets/${config.encryption.keyPath}`;
const SECRET_KEY_DEFAULT_VERSION = `${SECRET_KEY}/versions/${config.encryption.defaultVersion}`;

const getEncryptionKey = async (): Promise<Buffer> => getEncryptionSecret(SECRET_KEY_DEFAULT_VERSION);

export const getAllEncryptionKeys = async (): Promise<Buffer[]> => {
  const secretManagerClient = new SecretManagerServiceClient();

  const [versions] = await secretManagerClient.listSecretVersions({
    parent: SECRET_KEY,
  });

  const enabledVersions = versions.filter(_ => _.state === "ENABLED");
  // sort to put default version first
  enabledVersions.sort((a, b) => isDefaultKey(`${a.name}`) ? -1 : isDefaultKey(`${b.name}`) ? 1 : 0);

  return Promise.all(
    enabledVersions.map(async _ => getEncryptionSecret(`${_.name}`))
  );
};

const isDefaultKey = (_: string) => SECRET_KEY_DEFAULT_VERSION.substring(SECRET_KEY_DEFAULT_VERSION.length - 2) === _.substring(_.length - 2);

async function getEncryptionSecret(keyPathIncludingVersion: string): Promise<Buffer> {
  const secretManagerClient = new SecretManagerServiceClient();

  console.log("getEncryptionSecret:", `Getting encryption key: ${keyPathIncludingVersion}`);
  const [secret] = await secretManagerClient.accessSecretVersion({
    name: keyPathIncludingVersion,
  });

  // @ts-ignore
  return Buffer.from(secret.payload.data.toString(), 'base64');
}

export default getEncryptionKey;
