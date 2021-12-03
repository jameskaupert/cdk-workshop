import { aws_dynamodb, aws_lambda } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface HitCounterProps {
  downstream: aws_lambda.IFunction;
  /**
   * The read capacity units for the table
   *
   * Must be >5 and <20
   *
   * @default 5
   */
  readCapacity?: number;
}

export class HitCounter extends Construct {
  public readonly handler: aws_lambda.Function;

  constructor(scope: any, id: string, props: HitCounterProps) {
    if (
      props.readCapacity !== undefined &&
      (props.readCapacity < 5 || props.readCapacity > 20)
    ) {
      throw new Error("readCapacity must be greater than 5 and less than 20");
    }
    super(scope, id);

    const table = new aws_dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: aws_dynamodb.AttributeType.STRING },
      encryption: aws_dynamodb.TableEncryption.AWS_MANAGED,
      readCapacity: props.readCapacity ?? 5,
    });

    this.handler = new aws_lambda.Function(this, "HitCounterHandler", {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      handler: "hitcounter.handler",
      code: aws_lambda.Code.fromAsset("lambda"),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(this.handler);

    props.downstream.grantInvoke(this.handler);
  }
}
