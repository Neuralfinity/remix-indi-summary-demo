import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";
import { GraphQLClient, gql } from "graphql-request";

export type { Note } from "@prisma/client";

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}

export async function createSummary(inputstring: string) {
  const magicsummaryclient = new GraphQLClient('https://beta.eu-north.computational-magic.com/api/v1');

  const magicapikey = process.env.MAGICXAPIKEY

  magicsummaryclient.setHeader('X-API-KEY', magicapikey as string)

  const query = gql`query($text: String!) {summary(input: $text, minLen: 10, maxLen: 150)}`

  const variables = {"text": inputstring}

  const data = magicsummaryclient.request(query, variables)

  return data
}
