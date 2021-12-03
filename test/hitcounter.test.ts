import { Template, Capture } from "@aws-cdk/assertions";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { HitCounter } from "../lib/hitcounter";
import { template } from "@babel/core";

test("DynamoDB Table Created", () => {
  const stack = new cdk.Stack();

  // WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

test("Lambda Function created with env vars", () => {
  const stack = new cdk.Stack();

  // WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
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
  const stack = new cdk.Stack();

  //WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  //THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    SSESpecification: {
      SSEEnabled: true,
    },
  });
});

test("read capacity must be >5", () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, "MyTestConstruct", {
      downstream: new lambda.Function(stack, "TestFunction", {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "hello.handler",
        code: lambda.Code.fromAsset("lambda"),
      }),
      readCapacity: 4,
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});

test("read capacity must be <20", () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, "MyTestConstruct", {
      downstream: new lambda.Function(stack, "TestFunction", {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "hello.handler",
        code: lambda.Code.fromAsset("lambda"),
      }),
      readCapacity: 21,
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});
