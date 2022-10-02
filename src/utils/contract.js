import algosdk from "algosdk";
import {
  algodClient,
  indexerClient,
  minRound,
  myAlgoConnect,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
  blogDappNote,
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/blog_contract_approval.teal";
import clearProgram from "!!raw-loader!../contracts/blog_contract_clear.teal";
import { base64ToUTF8String, utf8ToBase64String } from "./conversions";

class Blog {
  constructor(title, image, content, upvote, downvote, appId, owner) {
    this.title = title;
    this.image = image;
    this.content = content;
    this.upvote = upvote;
    this.downvote = downvote;
    this.appId = appId;
    this.owner = owner;
  }
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
};

// CREATE BLOG: ApplicationCreateTxn
export const createBlogAction = async (senderAddress, blog) => {
  console.log("Adding blog...");

  let params = await algodClient.getTransactionParams().do();

  // Compile programs
  const compiledApprovalProgram = await compileProgram(approvalProgram);
  const compiledClearProgram = await compileProgram(clearProgram);

  // Build note to identify transaction later and required app args as Uint8Arrays
  let note = new TextEncoder().encode(blogDappNote);
  let title = new TextEncoder().encode(blog.title);
  let image = new TextEncoder().encode(blog.image);
  let content = new TextEncoder().encode(blog.content);

  let appArgs = [title, image, content];

  // Create ApplicationCreateTxn
  let txn = algosdk.makeApplicationCreateTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numLocalInts: numLocalInts,
    numLocalByteSlices: numLocalBytes,
    numGlobalInts: numGlobalInts,
    numGlobalByteSlices: numGlobalBytes,
    note: note,
    appArgs: appArgs,
  });

  // Get transaction ID
  let txId = txn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // Get created application id and notify about completion
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["application-index"];
  console.log("Created new app-id: ", appId);
  return appId;
};

// Edit BLOG
export const editAction = async (senderAddress, blog) => {
  console.log("Edit blog...");

  let params = await algodClient.getTransactionParams().do();

  // Build required app args as Uint8Array
  let editArg = new TextEncoder().encode("edit");
  let title = new TextEncoder().encode(blog.title);
  let image = new TextEncoder().encode(blog.image);
  let content = new TextEncoder().encode(blog.content);
  let appArgs = [editArg, title, image, content];

  // Create ApplicationCallTxn
  let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: blog.appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params,
    appArgs: appArgs,
  });

  // Get transaction ID
  let txId = appCallTxn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(appCallTxn.toByte());

  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
};

// UPVOTE BLOG
export const upvoteAction = async (senderAddress, blog) => {
  console.log("Upvote blog...");

  let params = await algodClient.getTransactionParams().do();

  // Build required app args as Uint8Array
  let upvoteArg = new TextEncoder().encode("upvote");

  let appArgs = [upvoteArg];

  // Create ApplicationCallTxn
  let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: blog.appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params,
    appArgs: appArgs,
  });

  // Get transaction ID
  let txId = appCallTxn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(appCallTxn.toByte());

  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
};

// DOWNVOTE BLOG
export const downvoteAction = async (senderAddress, blog) => {
  console.log("downvote blog...");

  let params = await algodClient.getTransactionParams().do();

  // Build required app args as Uint8Array
  let downvoteArg = new TextEncoder().encode("downvote");

  let appArgs = [downvoteArg];

  // Create ApplicationCallTxn
  let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: blog.appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params,
    appArgs: appArgs,
  });

  // Get transaction ID
  let txId = appCallTxn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(appCallTxn.toByte());

  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
};

// DELETE BLOG: ApplicationDeleteTxn
export const deleteAction = async (senderAddress, index) => {
  console.log("Deleting application...");

  let params = await algodClient.getTransactionParams().do();

  // Create ApplicationDeleteTxn
  let txn = algosdk.makeApplicationDeleteTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    appIndex: index,
  });

  // Get transaction ID
  let txId = txn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // Get application id of deleted application and notify about completion
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["txn"]["txn"].apid;
  console.log("Deleted app-id: ", appId);
};

// GET BLOGS: Use indexer
export const getBlogsAction = async () => {
  console.log("Fetching blog...");
  let note = new TextEncoder().encode(blogDappNote);
  let encodedNote = Buffer.from(note).toString("base64");

  // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
  let transactionInfo = await indexerClient
    .searchForTransactions()
    .notePrefix(encodedNote)
    .txType("appl")
    .minRound(minRound)
    .do();
  let blogs = [];
  for (const transaction of transactionInfo.transactions) {
    let appId = transaction["created-application-index"];
    if (appId) {
      // Step 2: Get each application by application id
      let blog = await getApplication(appId);
      if (blog) {
        blogs.push(blog);
      }
    }
  }
  console.log("Blog fetched.");
  return blogs;
};

const getApplication = async (appId) => {
  try {
    // 1. Get application by appId
    let response = await indexerClient
      .lookupApplications(appId)
      .includeAll(true)
      .do();
    if (response.application.deleted) {
      return null;
    }
    let globalState = response.application.params["global-state"];

    // 2. Parse fields of response and return product
    let owner = response.application.params.creator;
    let title = "";
    let image = "";
    let content = "";
    let upvote = 0;
    let downvote = 0;

    const getField = (fieldName, globalState) => {
      return globalState.find((state) => {
        return state.key === utf8ToBase64String(fieldName);
      });
    };

    if (getField("TITLE", globalState) !== undefined) {
      let field = getField("TITLE", globalState).value.bytes;
      title = base64ToUTF8String(field);
    }

    if (getField("IMAGE", globalState) !== undefined) {
      let field = getField("IMAGE", globalState).value.bytes;
      image = base64ToUTF8String(field);
    }

    // check for blog data
    for (let i = 0; i < 60; i++) {
      let key_index = i.toString();
      if (getField(key_index, globalState) !== undefined) {
        let field = getField(key_index, globalState).value.bytes;
        content += base64ToUTF8String(field);
      }
    }

    if (getField("CONTENT", globalState) !== undefined) {
      let field = getField("CONTENT", globalState).value.bytes;
      content = base64ToUTF8String(field);
    }

    if (getField("UPVOTE", globalState) !== undefined) {
      upvote = getField("UPVOTE", globalState).value.uint;
    }

    if (getField("DOWNVOTE", globalState) !== undefined) {
      downvote = getField("DOWNVOTE", globalState).value.uint;
    }

    return new Blog(title, image, content, upvote, downvote, appId, owner);
  } catch (err) {
    return null;
  }
};
