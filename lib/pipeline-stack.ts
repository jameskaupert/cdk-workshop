import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { GitHubTrigger } from "aws-cdk-lib/aws-codepipeline-actions";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";

export class WorkshopPipelineStack extends Stack {
  constructor(scope: any, id: string, props?: StackProps) {
    super(scope, id, props);

    const repoString = "https://github.com/jameskaupert/cdk-workshop";
    const branch = "main";

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "WorkshopPipeline",
      synth: new CodeBuildStep("SynthStep", {
        input: CodePipelineSource.gitHub(repoString, branch, {
          authentication: SecretValue.secretsManager("github-token"),
          trigger: GitHubTrigger.WEBHOOK,
        }),
        installCommands: ["npm install -g aws-cdk"],
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
