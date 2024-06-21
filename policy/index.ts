import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { PolicyPack, ResourceValidationPolicy, validateRemediateResourceOfType, validateResourceOfType } from "@pulumi/policy";

const stack = pulumi.getStack();

new PolicyPack("aws-example-policies", {
    policies: [
        {
            name: "check-subnet-ip-assignment",
            description: "Ensures that a subnet does not have a public ip at the time of launch",
            enforcementLevel: "advisory",
            validateResource: [
                validateResourceOfType (aws.ec2.Subnet, (subnet, args, reportViolation) => {
                    if (subnet.mapPublicIpOnLaunch == true){
                        reportViolation("Subnet should not have a public ip assigned at launch. Set this property to False");
                    }
                }),
            ],
        },

        {
            name: "vm-size-check-based-on-stack",
            description: "Ensures that the VM size is compliant with the organization's policy",
            enforcementLevel: "mandatory",
            validateResource: [
                validateResourceOfType (aws.ec2.Instance, (vm, args, reportViolation) => {
                    if (stack.includes("dev") && vm.instanceType != "t2.micro"){
                        reportViolation("Instance size is too big for a dev stack. Please use t2.micro");
                    }
                }),
            ],
        },
    ]

});

/*const ec2InstanceSize: ResourceValidationPolicy = {
    name: "vm-size-check-based-on-stack",
    description: "Ensures that the VM size is compliant with the organization's policy",
    enforcementLevel: "advisory",
    validateResource: [
        validateResourceOfType (aws.ec2.Instance, (vm, args, reportViolation) => {
            if (stack == "dev" && vm.instanceType != "t2.micro"){
                reportViolation("Instance size is too big for a dev stack. Please use t2.micro");
            }
        }),
    ]
}; */

/*new PolicyPack("aws-typescript", {
    policies: [{
        name: "s3-no-public-read",
        description: "Prohibits setting the publicRead or publicReadWrite permission on AWS S3 buckets.",
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
            if (bucket.acl === "public-read" || bucket.acl === "public-read-write") {
                reportViolation(
                    "You cannot set public-read or public-read-write on an S3 bucket. " +
                    "Read more about ACLs here: https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html");
            }
        }),
    }],
});*/
