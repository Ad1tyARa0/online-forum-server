import { isThreadBodyValid, isThreadTitleValid } from "../validators/thread";
import { QueryArrayResult } from "./QueryArrayResult";
import { Thread } from "./Thread";
import { ThreadCategory } from "./ThreadCategories";
// import { ThreadCategory } from "./ThreadCategory";
import { User } from "./User";

export const createThread = async (
  userId: string | undefined | null,
  categoryId: string,
  title: string,
  body: string
): Promise<QueryArrayResult<Thread>> => {
  const titleMsg = isThreadTitleValid(title);
  if (titleMsg) {
    return {
      messages: [titleMsg],
    };
  }
  const bodyMsg = isThreadBodyValid(body);
  if (bodyMsg) {
    return {
      messages: [bodyMsg],
    };
  }

  // users must be logged in to post
  if (!userId) {
    return {
      messages: ["User not logged in."],
    };
  }

  const user = await User.findOne({
    Id: userId,
  });

  const category = await ThreadCategory.findOne({
    id: categoryId,
  });

  if (!category) {
    return {
      messages: ["category not found."],
    };
  }

  const thread = await Thread.create({
    title,
    body,
    user,
    category,
  }).save();

  if (!thread) {
    return {
      messages: ["Failed to create thread."],
    };
  }

  return {
    messages: ["Thread created successfully."],
  };
};
