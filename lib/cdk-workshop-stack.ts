import {
  App,
  Stack,
  StackProps,
  aws_lambda,
  aws_apigateway,
} from "aws-cdk-lib";
import { HitCounter } from "./hitcounter";

export class CdkWorkshopStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new aws_lambda.Function(this, "HelloHandler", {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      code: aws_lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    new aws_apigateway.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });
  }
}
