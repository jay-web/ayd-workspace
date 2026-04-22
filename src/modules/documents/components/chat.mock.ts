// import { MockAnswerItem, MockCitation, MockDocument } from "./chat.types";

// export const MOCK_DOCUMENTS: MockDocument[] = [
//   {
//     id: "serverless-debugging-guide",
//     name: "Serverless Debugging Guide.pdf",
//     subtitle: "Ready for Q&A",
//     status: "READY",
//     accent: "bg-emerald-50 text-emerald-600",
//   },
//   {
//     id: "node-journey-spec",
//     name: "Node.js Journey Product Spec.pdf",
//     subtitle: "Ready for Q&A",
//     status: "READY",
//     accent: "bg-blue-50 text-blue-600",
//   },
//   {
//     id: "system-architecture-overview",
//     name: "System Architecture Overview.pdf",
//     subtitle: "Ready for Q&A",
//     status: "READY",
//     accent: "bg-violet-50 text-violet-600",
//   },
// ];

// export const MOCK_CITATIONS: MockCitation[] = [
//   {
//     id: 1,
//     page: 12,
//     relevance: 98,
//     snippet:
//       "Use AWS X-Ray or CloudWatch Lambda Insights to analyze initialization duration and identify where time is spent during startup.",
//     highlight:
//       "These tools provide visibility into the INIT phase and help identify bottlenecks in your function startup.",
//   },
//   {
//     id: 2,
//     page: 15,
//     relevance: 92,
//     snippet:
//       "Reduce the deployment package size by removing unnecessary dependencies and using tree shaking.",
//     highlight:
//       "Smaller packages result in faster cold starts and lower initialization overhead.",
//   },
//   {
//     id: 3,
//     page: 18,
//     relevance: 87,
//     snippet:
//       "Enable provisioned concurrency for mission-critical functions to eliminate cold starts.",
//     highlight:
//       "Provisioned concurrency maintains pre-initialized environments for predictable performance.",
//   },
// ];

// export const MOCK_ANSWER_ITEMS: MockAnswerItem[] = [
//   {
//     text: "Analyze initialization duration using AWS X-Ray or CloudWatch Lambda Insights.",
//     citation: 1,
//   },
//   {
//     text: "Review function package size and minimize unused dependencies before deployment.",
//     citation: 2,
//   },
//   {
//     text: "Enable provisioned concurrency for critical endpoints with steady traffic needs.",
//     citation: 3,
//   },
//   {
//     text: "Optimize static initialization and avoid heavy imports during the bootstrap path.",
//     citation: 1,
//   },
// ];