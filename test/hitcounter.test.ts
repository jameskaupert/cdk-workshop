import { assertions, aws_lambda, Stack } from "aws-cdk-lib";
import { HitCounter } from "../lib/hitcounter";

test("DynamoDB Table Created", () => {
  const stack = new Stack();

  // WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new aws_lambda.Function(stack, "TestFunction", {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      handler: "hello.handler",
      code: aws_lambda.Code.fromAsset("lambda"),
    }),
  });

  // THEN
  const template = assertions.Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

test("Lambda Function created with env vars", () => {
  const stack = new Stack();

  // WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new aws_lambda.Function(stack, "TestFunction", {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      handler: "hello.handler",
      code: aws_lambda.Code.fromAsset("lambda"),
    }),
  });

  // THEN
  const template = assertions.Template.fromStack(stack);
  const envCapture = new assertions.Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: "TestFunction22AD90FC",
      },
      HITS_TABLE_NAME: {
        Ref: "MyTestConstructHits24A357F0",
      },
    },
  });
});

test("DynamoDB Table Created With Encryption", () => {
  const stack = new Stack();

  //WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new aws_lambda.Function(stack, "TestFunction", {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      handler: "hello.handler",
      code: aws_lambda.Code.fromAsset("lambda"),
    }),
  });

  //THEN
  const template = assertions.Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    SSESpecification: {
      SSEEnabled: true,
    },
  });
});

test("read capacity must be >5", () => {
  const stack = new Stack();

  expect(() => {
    new HitCounter(stack, "MyTestConstruct", {
      downstream: new aws_lambda.Function(stack, "TestFunction", {
        runtime: aws_lambda.Runtime.NODEJS_14_X,
        handler: "hello.handler",
        code: aws_lambda.Code.fromAsset("lambda"),
      }),
      readCapacity: 4,
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});

test("read capacity must be <20", () => {
  const stack = new Stack();

  expect(() => {
    new HitCounter(stack, "MyTestConstruct", {
      downstream: new aws_lambda.Function(stack, "TestFunction", {
        runtime: aws_lambda.Runtime.NODEJS_14_X,
        handler: "hello.handler",
        code: aws_lambda.Code.fromAsset("lambda"),
      }),
      readCapacity: 21,
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});
