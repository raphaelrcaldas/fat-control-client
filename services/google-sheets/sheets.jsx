"use server";
import { google } from "googleapis";

async function getSheetData() {
   const glAuth = await google.auth.getClient({
      projectId: "analog-subset-279022",
      credentials: {
         type: "service_account",
         project_id: "analog-subset-279022",
         private_key_id: "ba4ac2033b5ec49761632fcffb2eff2bb0a6c830",
         private_key:
            "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCsKuZtXqcCCGIV\n9jqh2MXfiMkQTzwUDAbjfDDBokaVU+Nh7j3cfqMrhXtLCFlhvLFJMVWNh/4zA50B\nDD1UbRfK0z5ZkKFuAx8iK9q+QdD8wOlRaRfiib4zrNUY8BA0s1gf3TxCEDRaCfZi\nfo3WuKcItWTG9DOBkNDq23LtrH0wG8p/zS447hGvXeu3jQGuXcDJxdqDKATdCmIV\nWRrvKYSctvmpJodQ+xZkDquxQyPdNALyX+6/JoaFdYEWLOPDhOwNN2ndIqPKUG6m\n537GW2xNw6CAdDyqT+bL1mqHtu3fZ02xUrwFrZJcVP7vfsNd8qrg+tu5xDlNNnW+\nBw5Q/wVXAgMBAAECggEACu8jOOv2JaoRof0Ze9Y6uY0ZiTh3A3uWDmmAkTOfUZ7a\ncImYZ9dVFo+remLv25tdE7MXO14D1gqTNJH/QnbhOBzoDKPOVMshoDfHydB/7NAg\nS+7QOQTFeHOwCZ2UHJINSozFkG6GB00zAXixxQ1vckf5kVcd/vW1saIOmlXw52v/\nEW+qopzZ9oxYLTmxh04248OYcOK1ln7IWxI6yOSj+C74AYHY/Eo2mrjzaSYf6dLd\nBVYIyG7bCvEytRekJrYBgKGDccsXUNKmEFLg/vPLEzbcwviHIj7F2Ea6mdKJlfkX\nSea9Ayfn9HrPKsoH+Lcz2atURrpSJhmmuY/rZxWITQKBgQDZW61g03FFQq1h+Hlb\nHf7JzxEsKv/bl5oWRElJimywl6HXRPTZJ5tcx7zkWL5GiaTcsFoS/56DqxRTSGkM\nNVYGZPasixZ7DM5ukT+6eB92i85PEfW4nE3WXGav2MaLwpD0llM9i3obpnGVoEoe\nGr4WM6aOu9Hvva0mMPD/09iu5QKBgQDKxocbtSt+HNCZjzuVXNrJI0pqg6H3UMDo\n1L82Xoex8iRysyLmEp/0WmwTItT7rDljZ015rZ04252MbH3dDH9a2W0h3Vjcd6OB\n/4Q8yVzQICDi+fE1aYZuRUTtpgW2DDrdPgOW7CLuonJAQg/UA0I9y//tctAbjGlu\nME4Z8wfjiwKBgQCRSErqBkqWzcuQSYHsGm98OrCywgcEox92NKx7wE+H9cJSXh/+\nqg+Zg1RJmNuN0GDmteVu/3bXcVmDlUnJxDi8y21pxQoAs32jv+hF3hbBqQ78IPgK\nLkeEuXxVm2KSdjlnkrcO0xSKOMWBCoOf/aYCtwFkNDxNr411ko7zoIkb1QKBgQDD\nOqU2XhXD1AZa8naRddcHtLyfFKFKNiulf7+hnx3Si6nf7Oz6yo/KeYx4WB7rOIQA\nWqNTNX6cEYX8fzAnNTMgyxmxcyVtDpsUPGibBdwgXe6L2c0Mec7+OB8HF8OD5P5/\nqIdYNX3kd+68Q15t571NNi3v9Yy8GVIgzs1DWqQLxQKBgQCXIqHA6Q1h7J1cyFyj\nU0UKVHEja7nFKsMKChmhiD5moeUFqw9GGsMqiF/T/pXlhdu+2uAJ8TtvPnD1yMz4\nH4Z42KdCr3N8DViLP8H43P1Km0yfgMYVoJ74a6DP0rsqVSSG2kY8C2WGiP6q+4Qp\nH3ECdeBqoKs2d4dI7FImU1kZ4w==\n-----END PRIVATE KEY-----\n",
         client_email: "analog-subset-279022@appspot.gserviceaccount.com",
         client_id: "102865999397165158687",
         auth_uri: "https://accounts.google.com/o/oauth2/auth",
         token_uri: "https://oauth2.googleapis.com/token",
         auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
         client_x509_cert_url:
            "https://www.googleapis.com/robot/v1/metadata/x509/analog-subset-279022%40appspot.gserviceaccount.com",
         universe_domain: "googleapis.com",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
   });

   const glSheets = google.sheets({ version: "v4", auth: glAuth });

   const data = await glSheets.spreadsheets.values.get({
      spreadsheetId: "1-K3twY6tZIfKEsKgTHuM8VQgEnFrEgPJvvk2h1f20tQ",
      range: "TRIP!B1:S",
   });

   return data.data.values;
}

export async function getTripData() {
   const rawData = await getSheetData();

   const data = rawData.slice(1).filter((row) => {
      return row.length != 0 && row[0] != "";
   });

   const dataResponse = data.map((row) => {
      return {
         pg: row[0],
         nomeGuerra: row[1],
         trig: row[2],
         func: row[3],
         oper: row[4],
         cvi: row[5],
         cemal: row[6],
         tovn: row[7],
         crm: row[8],
         imae: row[9],
         val_pass: row[10],
         simulador: row[11],
         ant_opr: row[12],
         duv: row[13],
         dsv: row[14],
         hTotal: row[15],
         hAno: row[16],
      };
   });

   return dataResponse;
}
