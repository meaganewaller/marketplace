# Sorbet RBI References

Real-world RBI files from gems that include Sorbet type definitions.

## Contents

- [RBI File Conventions](#rbi-file-conventions)
- stripe-ruby Examples (below)
- [External Resources](#external-resources)

## RBI File Conventions

### Directory Structure

```text
rbi/
├── gem_name.rbi      # Main gem RBI file
└── gem_name/
    ├── resources/    # Resource type definitions
    ├── services/     # Service type definitions
    └── params/       # Parameter type definitions
```

### RBI Syntax Key Points

1. **Empty method bodies** - use `; end` or just `end`
2. **Typed sigils** - use `# typed: true` or `# typed: strict`
3. **No implementation** - only type declarations and structure

## stripe-ruby Examples

Source: https://github.com/stripe/stripe-ruby (MIT License, see
[LICENSE](LICENSE)), copied from commit
[`566a84df30c6708f87f02ced51c4427904d19214`](https://github.com/stripe/stripe-ruby/tree/566a84df30c6708f87f02ced51c4427904d19214/rbi)
("Update generated code", #1744, 2025-12-15).

This is a curated sample of 13 files, not the whole generated tree. The
upstream `rbi/` holds roughly 950 files that repeat the same few patterns, so
one or two of each kind teaches as much as all of them. The sample keeps the
three files linked below, small and nested-namespace examples of each kind,
and one file from the newer `v2` API.

To refresh, set `rev` to a newer commit or tag and run from this directory. It
re-fetches the same 13 paths; to change the sample, edit the tree below too.

```bash
rev=566a84df30c6708f87f02ced51c4427904d19214
for f in $(find rbi -name '*.rbi') LICENSE; do
  curl -fsSL "https://raw.githubusercontent.com/stripe/stripe-ruby/$rev/$f" -o "$f"
done
```

### stripe-ruby Directory Structure

```text
stripe-ruby/
└── rbi/stripe/
    ├── resources/            # API response types
    │   ├── application.rbi
    │   ├── customer.rbi
    │   ├── billing/meter.rbi
    │   └── v2/billing/meter_event.rbi
    ├── services/             # API operations
    │   ├── customer_service.rbi
    │   ├── mandate_service.rbi
    │   ├── billing/meter_service.rbi
    │   └── checkout/session_service.rbi
    └── params/               # Request parameter types
        ├── customer_create_params.rbi
        ├── customer_list_params.rbi
        ├── mandate_retrieve_params.rbi
        ├── billing/meter_create_params.rbi
        └── checkout/session_list_params.rbi
```

### Resources

Resource files define API response types with nested classes:

**Pattern**: [rbi/stripe/resources/customer.rbi](rbi/stripe/resources/customer.rbi)

```ruby
# typed: true
module Stripe
  class Customer < APIResource
    # Nested class for address
    class Address < ::Stripe::StripeObject
      sig { returns(T.nilable(String)) }
      def city; end
      sig { returns(T.nilable(String)) }
      def country; end
    end

    # Top-level attributes
    sig { returns(T.nilable(Address)) }
    def address; end
    sig { returns(T.nilable(Integer)) }
    def balance; end
    sig { returns(T::Boolean) }
    def livemode; end

    # API methods
    sig {
      params(params: T.any(::Stripe::CustomerCreateParams, T::Hash[T.untyped, T.untyped]), opts: T.untyped)
        .returns(::Stripe::Customer)
    }
    def self.create(params = {}, opts = {}); end
  end
end
```

### Services

Service files define API operation methods:

**Pattern**: [rbi/stripe/services/customer_service.rbi](rbi/stripe/services/customer_service.rbi)

```ruby
# typed: true
module Stripe
  class CustomerService < StripeService
    attr_reader :balance_transactions
    attr_reader :payment_methods

    sig {
      params(params: T.any(::Stripe::CustomerCreateParams, T::Hash[T.untyped, T.untyped]), opts: T.untyped)
        .returns(::Stripe::Customer)
    }
    def create(params = {}, opts = {}); end

    sig {
      params(customer: String, params: T.any(::Stripe::CustomerRetrieveParams, T::Hash[T.untyped, T.untyped]), opts: T.untyped)
        .returns(::Stripe::Customer)
    }
    def retrieve(customer, params = {}, opts = {}); end
  end
end
```

### Params

Params files define typed request parameters with getters/setters:

**Pattern**: [rbi/stripe/params/customer_create_params.rbi](rbi/stripe/params/customer_create_params.rbi)

```ruby
# typed: true
module Stripe
  class CustomerCreateParams < ::Stripe::RequestParams
    class Address < ::Stripe::RequestParams
      sig { returns(T.nilable(String)) }
      def city; end
      sig { params(_city: T.nilable(String)).returns(T.nilable(String)) }
      def city=(_city); end

      sig { params(city: T.nilable(String), country: T.nilable(String)).void }
      def initialize(city: nil, country: nil); end
    end

    sig { returns(T.nilable(CustomerCreateParams::Address)) }
    def address; end
  end
end
```

### Key Patterns

1. **Deeply Nested Classes** - Resource types use nested classes for complex objects
   - See: [customer.rbi](rbi/stripe/resources/customer.rbi) with `Address`, `InvoiceSettings`, `Shipping`, `Tax`

2. **Union Types with `T.any`** - For polymorphic fields

   ```ruby
   sig { returns(T.nilable(T.any(String, ::Stripe::PaymentMethod))) }
   def default_payment_method; end
   ```

3. **Multi-line Signatures** - For methods with many parameters

   ```ruby
   sig {
     params(params: T.any(::Stripe::CustomerCreateParams, T::Hash[T.untyped, T.untyped]), opts: T.untyped)
       .returns(::Stripe::Customer)
   }
   def create(params = {}, opts = {}); end
   ```

4. **Collection Types** - Arrays and hashes with typed elements

   ```ruby
   sig { returns(T.nilable(T::Array[CustomField])) }
   def custom_fields; end

   sig { returns(T.nilable(T::Hash[String, Integer])) }
   def invoice_credit_balance; end
   ```

5. **Boolean Type** - Using `T::Boolean`

   ```ruby
   sig { returns(T::Boolean) }
   def livemode; end
   ```

6. **Instance and Class Methods** - Both defined for API operations

   ```ruby
   sig { params(params: T.any(...)).returns(::Stripe::Customer) }
   def self.create(params = {}, opts = {}); end

   sig { params(params: T.any(...)).returns(::Stripe::Customer) }
   def delete(params = {}, opts = {}); end
   ```

## External Resources

- [Sorbet RBI docs](https://sorbet.org/docs/rbi) - Official RBI documentation
