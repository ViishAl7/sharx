import { API_BASE } from "../config";

/**
 * ---------------------------------------------------------
 * AUTH TOKEN
 * ---------------------------------------------------------
 */

function getToken() {
  if (
    typeof window === "undefined"
  ) {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    ""
  );
}

/**
 * ---------------------------------------------------------
 * CLIENT INSTANCE
 * ---------------------------------------------------------
 *
 * This identifies the current browser tab/session.
 */

function getClientInstanceId() {
  if (
    typeof window === "undefined"
  ) {
    return "";
  }

  const key =
    "sharx_reward_client_instance";

  let value =
    sessionStorage.getItem(key);

  if (!value) {
    value = `${Date.now()}-${
      crypto.randomUUID?.() ||
      Math.random()
        .toString(36)
        .slice(2)
    }`;

    sessionStorage.setItem(
      key,
      value
    );
  }

  return value;
}

/**
 * ---------------------------------------------------------
 * GENERIC REQUEST
 * ---------------------------------------------------------
 */

async function request(
  path,
  options = {}
) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,

      headers: {
        Accept:
          "application/json",

        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error =
      new Error(
        data?.error ||
          data?.message ||
          `Request failed with HTTP ${response.status}`
      );

    error.status =
      response.status;

    error.code =
      data?.code;

    error.data = data;

    throw error;
  }

  return data;
}

/**
 * ---------------------------------------------------------
 * REWARD SESSION
 * ---------------------------------------------------------
 */

export async function startRewardSession(
  gameId
) {
  return request(
    "/rewards/session/start",
    {
      method: "POST",

      body: JSON.stringify({
        gameId,
        clientInstanceId:
          getClientInstanceId(),
      }),
    }
  );
}

export async function heartbeatRewardSession(
  sessionId
) {
  return request(
    "/rewards/session/heartbeat",
    {
      method: "POST",

      body: JSON.stringify({
        sessionId,

        clientInstanceId:
          getClientInstanceId(),
      }),
    }
  );
}

export async function endRewardSession(
  sessionId
) {
  return request(
    "/rewards/session/end",
    {
      method: "POST",

      body: JSON.stringify({
        sessionId,

        clientInstanceId:
          getClientInstanceId(),
      }),
    }
  );
}

/**
 * ---------------------------------------------------------
 * WALLET / REWARDS
 * ---------------------------------------------------------
 */

export async function getRewardMe() {
  return request(
    "/rewards/me"
  );
}

/**
 * ---------------------------------------------------------
 * WITHDRAWAL
 * ---------------------------------------------------------
 */

export async function createWithdrawal({
  amountRupees,
  method,
  destination,
}) {
  return request(
    "/withdrawals",
    {
      method: "POST",

      body: JSON.stringify({
        amountRupees,
        method,
        destination,
      }),
    }
  );
}

export async function getWithdrawals() {
  return request(
    "/withdrawals"
  );
}